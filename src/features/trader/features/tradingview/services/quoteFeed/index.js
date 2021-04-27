import moment from 'moment';
import BigNumber from 'bignumber.js';

import { isProd } from '../../../../../../config';
import apiClient from '../../../../../../common/services/apiClient';
import { CONTRACT_TYPE } from '../../../../../../common/enums';

import {
  transform,
  createQueryIntervals,
  generateGappedQuotes,
  MAX_BUCKETS,
  reBucket,
} from './utils';

const api = {
  // TODO: Public route, make request without token?
  getCandles: (contractCode, startTime, endTime, granularity, contractType) =>
    apiClient.get(`/contracts/${contractCode}/candles`, {
      params: {
        ...(isProd() && contractType !== CONTRACT_TYPE.SPOT
          ? { fieldName: 'mark_price' }
          : contractType === CONTRACT_TYPE.SPOT
          ? { fieldName: 'fair_price' }
          : {}),
        startTime,
        endTime,
        granularity: `${granularity}m`,
      },
      apiCallId: null,
    }),
};

export const multiQueryCandles = (contractCode, queries, granularity, contractType) =>
  new Promise(resolve => {
    if (!queries.length) {
      return resolve([]);
    }

    Promise.all(
      queries.map(({ startStr, endStr }) =>
        api.getCandles(contractCode, startStr, endStr, granularity, contractType).then(transform)
      )
    )
      .then(results => {
        //why need to use reduce() to pick out the quotes data?
        resolve(
          results.reduce((allQuotes, { ok, data: quotes } = {}) => {
            return ok && quotes.length ? [...allQuotes, ...quotes] : [...allQuotes];
          }, [])
        );
      })
      .catch(err => {
        console.log(err);
      });
  });

const quoteFeedService = ({ contractsMetadata }) => ({
  fetchInitialData: (contractCode, start, end, parameters) => {
    const startDate = start * 1000;
    const endDate = end * 1000;
    return new Promise((resolve, reject) => {
      if (!contractsMetadata[contractCode]) {
        return;
      }

      let needsRebucket = false;

      let { resolution: granularity } = parameters;
      if (
        granularity === 'D' ||
        granularity === 'M' ||
        granularity === 'W' ||
        Number(granularity) > 30
      ) {
        granularity = '30';
        needsRebucket = true;
      }

      const mListTime = moment(contractsMetadata[contractCode].listTime);
      const mStartDate = moment.max(moment(startDate), mListTime);

      const startIsAfterListTime = mStartDate.isAfter(mListTime);
      const queries = createQueryIntervals(mStartDate, endDate, granularity);

      multiQueryCandles(
        contractCode,
        queries,
        granularity,
        contractsMetadata[contractCode].type
      ).then(data => {

        let quotes = data.sort((a, b) => a.time - b.time);
        // .filter(({ close, indexPrice }) => !!close);

        if (needsRebucket) {
          quotes = reBucket(quotes, 1000 * 60 * 60 * 24);
        }
        resolve({
          quotes,
          moreAvailable: startIsAfterListTime,
        });
      });
    });
  },

  fetchPaginationData(contractCode, startDate, endDate, parameters, cb) {
    if (!contractsMetadata[contractCode]) {
      return;
    }
    const { period: granularity } = parameters;

    const { listTime } = contractsMetadata[contractCode];
    const startIsAfterListTime = moment(startDate).isAfter(moment(listTime));
    const queries = createQueryIntervals(startDate, endDate, granularity);

    multiQueryCandles(
      contractCode,
      [...queries],
      granularity,
      contractsMetadata[contractCode].type
    ).then(quotes =>
      cb({
        quotes: quotes.length
          ? quotes
          : generateGappedQuotes(startIsAfterListTime ? startDate : listTime),
        moreAvailable:
          startIsAfterListTime ||
          quotes.length ===
            BigNumber(MAX_BUCKETS)
              .multipliedBy(queries.length)
              .toNumber(),
      })
    );
  },
});

export default quoteFeedService;
