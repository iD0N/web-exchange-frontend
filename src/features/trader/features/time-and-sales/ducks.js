import { combineReducers } from 'redux';
import { takeLatest, takeEvery, call, put, select } from 'redux-saga/effects';
import { createSelector } from 'reselect';
import BigNumber from 'bignumber.js';
import omit from 'lodash.omit';

import {
  createReducer,
  createActionCreator,
  createApiActionCreators,
  createActionType,
  REQUEST,
  SUCCESS,
} from '../../../../common/utils/reduxHelpers';
import { toPriceString } from '../../../../common/utils/numberHelpers';
import { DIRECTION } from '../../../../common/enums';
import { STORE_TICKER_DATA_BATCH, selectGlobalContract } from '../../data-store/ducks';

import { MAX_TRADES_COUNT } from './constants';
import api from './api';
import { normalizeAuction } from './utils';

let lastTradeTime = {};

/**
 * ACTION TYPES
 */
export const FETCH_AUCTIONS = 'timeAndSales/FETCH_AUCTIONS';
export const STORE_AUCTION_DATA = 'timeAndSales/STORE_AUCTION_DATA';
export const CLEAR_CONTRACT_DATA = 'timeAndSales/CLEAR_CONTRACT_DATA';
export const UPDATE_MIN_TRADE_SIZE = 'timeAndSales/UPDATE_MIN_TRADE_SIZE';

/**
 * ACTIONS
 */
export const fetchAuctionsActions = createApiActionCreators(FETCH_AUCTIONS);
export const storeAuctionDataAction = createActionCreator(STORE_AUCTION_DATA);
export const clearContractDataAction = createActionCreator(CLEAR_CONTRACT_DATA);
export const updateMinTradeSizeAction = createActionCreator(UPDATE_MIN_TRADE_SIZE);

/**
 * REDUCERS
 */
const initialState = {
  fromTicker: {},
  data: {},
  minTradeSize: 0,
};

const fromTicker = createReducer(initialState.fromTicker, {
  [STORE_TICKER_DATA_BATCH]: (state, batch) => {
    return batch.reduce((acc, tickerData) => {
      const { contractCode, lastTradeTime, lastTradeVolume, lastTradePrice } = tickerData;
      if (BigNumber(lastTradeVolume).isZero()) {
        return acc;
      }
      const auctionData = normalizeAuction({
        volume: lastTradeVolume,
        price: lastTradePrice,
        logicalTime: lastTradeTime,
      });
      if (!auctionData) {
        return acc;
      }
      if (state[contractCode]) {
        const [lastSale] = state[contractCode];
        if (lastSale.lastTradeTime !== lastTradeTime) {
          return {
            ...acc,
            [contractCode]: [
              auctionData,
              ...(acc[contractCode] || []),
              ...state[contractCode],
            ].slice(0, MAX_TRADES_COUNT),
          };
        }
        return acc;
      }
      return {
        ...acc,
        [contractCode]: [auctionData],
      };
    }, state);
  },
  [CLEAR_CONTRACT_DATA]: (state, contractCode) => omit(state, contractCode),
});

const minTradeSize = createReducer(initialState.minTradeSize, {
  [UPDATE_MIN_TRADE_SIZE]: (state, newSize) => newSize,
});

const data = createReducer(initialState.data, {
  [FETCH_AUCTIONS]: {
    [SUCCESS]: (state, { auctions, contractCode, minTradeSize, priceDecimals }) => ({
      ...state,
      [contractCode]: {
        ...(state[contractCode] || {}),
        [minTradeSize]: auctions.map(auction => ({
          ...auction,
          lastTradePrice: toPriceString(auction.lastTradePrice, priceDecimals),
        })),
      },
    }),
  },
  [CLEAR_CONTRACT_DATA]: (state, contractCode) => omit(state, contractCode),
});

export default combineReducers({
  fromTicker,
  data,
  minTradeSize,
});

/**
 * SELECTORS
 */
export const selectTimeAndSales = state => state.timeAndSales;

export const selectTimeAndSalesFromTicker = state => selectTimeAndSales(state).fromTicker;
export const selectTimeAndSalesData = state => selectTimeAndSales(state).data;
export const selectMinTradeSize = state => selectTimeAndSales(state).minTradeSize;

export const selectFilteredTimeAndSales = createSelector(
  selectTimeAndSalesFromTicker,
  selectTimeAndSalesData,
  selectGlobalContract,
  selectMinTradeSize,
  (fromTicker, data, { contractCode }, minTradeSize) => {
    if (!data[contractCode]) {
      return [];
    }
    const tickerData = fromTicker[contractCode] || [];
    const contractMinSizeData = data[contractCode][minTradeSize] || [];
    const uniqueTimes = {};
    return [...tickerData, ...contractMinSizeData]
      .sort((a, b) => b.lastTradeTimestamp - a.lastTradeTimestamp)
      .reduceRight((newList, auction) => {
        if (uniqueTimes[auction.lastTradeTime]) {
          return newList;
        }
        uniqueTimes[auction.lastTradeTime] = true;

        const [priorAuction] = newList;
        if (priorAuction) {
          const { lastTradePrice: tradePrice } = auction;
          const { lastTradePrice: priorTradePrice } = priorAuction;
          const isGreaterThanPrior = BigNumber(tradePrice).isGreaterThan(priorTradePrice);
          const isEqualToPrior = BigNumber(tradePrice).isEqualTo(priorTradePrice);
          const direction = isGreaterThanPrior
            ? DIRECTION.UP
            : isEqualToPrior
            ? priorAuction.direction
            : DIRECTION.DOWN;
          return [{ ...auction, direction }, ...newList];
        }
        return [{ ...auction, direction: undefined }, ...newList];
      }, [])
      .filter(auction => BigNumber(auction.lastTradeVolume).isGreaterThanOrEqualTo(minTradeSize))
      .slice(0, MAX_TRADES_COUNT);
  }
);

/**
 * SAGAS
 */
function* fetchAuctions({ payload: { contractCode, minTradeSize } }) {
  const resp = yield call(api.auctions, { contractCode, minTradeSize });
  const { priceDecimals } = yield select(selectGlobalContract);

  if (resp.ok) {
    yield put(
      fetchAuctionsActions.success({
        auctions: resp.data.auctions,
        contractCode,
        minTradeSize,
        priceDecimals,
      })
    );
  }
}

function* storeFromTicker({ payload: batch }) {
  const { contractCode, priceDecimals } = yield select(selectGlobalContract);
  for (const tickerData of batch) {
    if (
      tickerData.contractCode === contractCode &&
      (!lastTradeTime[contractCode] || lastTradeTime[contractCode] !== tickerData.lastTradeTime)
    ) {
      lastTradeTime[contractCode] = tickerData.lastTradeTime;
      yield put(
        storeAuctionDataAction({
          ...tickerData,
          lastTradePrice: toPriceString(tickerData.lastTradePrice, priceDecimals),
        })
      );
    }
  }
}

export function* timeAndSalesSaga() {
  yield takeLatest(createActionType(FETCH_AUCTIONS, REQUEST), fetchAuctions);
  yield takeEvery(STORE_TICKER_DATA_BATCH, storeFromTicker);
}
