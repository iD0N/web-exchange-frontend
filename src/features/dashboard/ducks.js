import { combineReducers } from 'redux';
import { takeLatest, call, put } from 'redux-saga/effects';
import { createSelector } from 'reselect';
import BigNumber from 'bignumber.js';
import moment from 'moment';

import { CONTRACT_TYPE } from '../../common/enums';
import {
  createReducer,
  createActionCreator,
  createApiActionCreators,
  createActionType,
  REQUEST,
  SUCCESS,
} from '../../common/utils/reduxHelpers';
import AlertService from '../../common/services/alert';
import { selectContracts, STORE_TICKER_DATA_BATCH } from '../trader/data-store/ducks';

import api from './api';

const defaultState = {
  summary: [],
  appendedTimeSeries: {},
};

const getOriginalPrice = (percentChange, referencePrice) =>
  BigNumber(referencePrice)
    .dividedBy(BigNumber(1).plus(percentChange))
    .dp(2)
    .toString();

export const NO_CONTRACT_VALUE = 'NO_CONTRACT_VALUE';

/**
 * ACTION TYPES
 */

export const FETCH_SUMMARY = 'dashboard/FETCH_SUMMARY';
export const CLEAR_SUMMARY = 'dashboard/CLEAR_SUMMARY';

/**
 * ACTIONS
 */
export const fetchSummaryActions = createApiActionCreators(FETCH_SUMMARY);
export const clearSummaryActions = createActionCreator(CLEAR_SUMMARY);

/**
 * REDUCERS
 */
const initialState = { ...defaultState };

const summary = createReducer(initialState.summary, {
  [FETCH_SUMMARY]: {
    [SUCCESS]: (_, { summary = {} }) =>
      Object.entries(summary)
        .reduce(
          (
            arr,
            [
              contractCode,
              {
                mark_price: markPrice,
                mark_price_pct_change: markPricePctChange,
                mark_price_timeseries: markPriceTimeseries,
                volume_base_24h: volume,
                open_interest: openInterest,
              },
              index,
            ]
          ) => {
            const lastestTime = moment(Object.keys(markPriceTimeseries)[0]);
            const timeSeries = {
              ...markPriceTimeseries,
              [moment(lastestTime)
                .add(-1, 'hours')
                .toISOString()]: getOriginalPrice(markPricePctChange['1h'], markPrice),
            };
            const series = Object.values(timeSeries).filter(a => BigNumber(a).isFinite());
            return [
              ...arr,
              {
                contractCode,
                index,
                markPrice,
                lastChartedPrice: markPrice,
                lastChartedTime: lastestTime.toISOString(),
                originalPrice1h: getOriginalPrice(markPricePctChange['1h'], markPrice),
                originalPrice24h: getOriginalPrice(markPricePctChange['24h'], markPrice),
                originalPrice7d: getOriginalPrice(markPricePctChange['7d'], markPrice),
                markPricePctChange1h: markPricePctChange['1h'],
                markPricePctChange24h: markPricePctChange['24h'],
                markPricePctChange7d: markPricePctChange['7d'],
                markPriceTimeseries: [
                  {
                    data: timeSeries,
                    min: BigNumber.min.apply(null, series).toNumber(),
                    max: BigNumber.max.apply(null, series).toNumber(),
                  },
                ],
                volume,
                openInterest,
              },
            ];
          },
          []
        )
        .sort((a, b) =>
          a.contractsMetadata === b.contractCode ? 0 : a.contractCode < b.contractCode ? -1 : 1
        ),
  },
  [CLEAR_SUMMARY]: state => defaultState.summary,
});

const appendedTimeSeries = createReducer(initialState.appendedTimeSeries, {
  [FETCH_SUMMARY]: {
    [SUCCESS]: (_, { summary = {} }) =>
      Object.entries(summary).reduce(
        (
          map,
          [contractCode, { mark_price: markPrice, mark_price_timeseries: markPriceTimeseries }]
        ) => ({
          ...map,
          [contractCode]: {
            lastAppendedTime: moment(Object.keys(markPriceTimeseries)[0]).toISOString(),
            lastAppendedPrice: markPrice,
            data: {},
          },
        }),
        {}
      ),
  },
  [STORE_TICKER_DATA_BATCH]: (state, batch) => {
    return batch.reduce((acc, { contractCode, markPrice, lastTradeTime, ...data }) => {
      if (!markPrice || !lastTradeTime) {
        return acc;
      }

      if (!state[contractCode]) {
        return {
          ...acc,
          [contractCode]: {
            lastAppendedTime: lastTradeTime,
            lastAppendedPrice: markPrice,
            data: { [lastTradeTime]: markPrice },
          },
        };
      }

      if (
        moment(lastTradeTime).diff(state[contractCode].lastAppendedTime) > 1000 * 60 * 5 ||
        BigNumber(state[contractCode].lastAppendedPrice)
          .minus(markPrice)
          .dividedBy(state[contractCode].lastAppendedPrice)
          .abs()
          .isGreaterThan(0.01)
      ) {
        // more than 5 minutes stale, or more than 1% change
        return {
          ...acc,
          [contractCode]: {
            lastAppendedTime: lastTradeTime,
            lastAppendedPrice: markPrice,
            data: { ...state[contractCode].data, [lastTradeTime]: markPrice },
          },
        };
      }

      return acc;
    }, state);
  },
});

export default combineReducers({
  summary,
  appendedTimeSeries,
});

/**
 * SELECTORS
 */

export const selectSummaryData = state => state.dashboard;

export const selectSummary = state => selectSummaryData(state).summary;
export const selectAppendedTimeSeries = state => selectSummaryData(state).appendedTimeSeries;

export const selectSummaryWithMetadata = createSelector(
  selectSummary,
  selectContracts,
  (summary, contracts) =>
    summary
      .filter(
        ({ contractCode }) =>
          !contracts[contractCode] || contracts[contractCode].type !== CONTRACT_TYPE.SPOT
      )
      .map(item => ({
        ...item,
        priceDecimals: contracts[item.contractCode] && contracts[item.contractCode].priceDecimals,
        quoteCurrency: contracts[item.contractCode] && contracts[item.contractCode].quoteCurrency,
      }))
);

export const selectTimeSeriesFactory = () =>
  createSelector(
    selectSummary,
    selectAppendedTimeSeries,
    (_, contractCode) => contractCode,
    (summaryItems, appended, contractCode) => {
      const summary = summaryItems.find(({ contractCode: contract }) => contract === contractCode);
      if (!summary || !summary.markPriceTimeseries) {
        return [];
      }
      if (
        !appended[contractCode] ||
        appended[contractCode].lastAppendedTime === summary.lastChartedTime
      ) {
        return summary.markPriceTimeseries;
      }

      const data = { ...summary.markPriceTimeseries[0].data, ...appended[contractCode].data };
      const series = Object.values(data);
      return [
        {
          data,
          min: BigNumber.min.apply(null, series).toNumber(),
          max: BigNumber.max.apply(null, series).toNumber(),
        },
      ];
    }
  );

/**
 * SAGAS
 */

export function* fetchSummary() {
  const resp = yield call(api.getSummary);

  if (resp.ok) {
    const summary = resp.data;
    yield put(fetchSummaryActions.success({ summary }));
  } else {
    AlertService.error('Could not load dashboard.');
  }
}

export function* dashboardSaga() {
  yield takeLatest(createActionType(FETCH_SUMMARY, REQUEST), fetchSummary);
}
