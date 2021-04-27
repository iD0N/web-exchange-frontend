import { combineReducers } from 'redux';
import { put, select, takeEvery } from 'redux-saga/effects';

import { startApiCall, finishApiCall } from '../../../../common/services/spinner';
import {
  createReducer,
  createMarkedSelector,
  createActionCreator,
} from '../../../../common/utils/reduxHelpers';
import { RECEIVE_MESSAGE } from '../../../../common/services/webSocket';
import {
  ORDER_SIZE_DECIMALS,
  PRICE_DECIMALS,
  WS_CHANNELS,
  WS_DATA_TYPES,
  ZERO_SIZE_STRING,
} from '../../constants';
import transformDataMessage from '../../data-store/transformDataMessage';
import {
  selectGlobalContractCode,
  selectGlobalContractTickSize,
  selectGlobalContractPriceDecimals,
  selectGlobalContractSizeDecimals,
} from '../../data-store/ducks';
import { widgetConfigIds, layouts } from '../../layout-manager/widgetConfigs';
import { selectLayout } from '../../layout-manager/ducks';
import { selectOpenOrdersFiltered } from '../orders/ducks'; // TODO uplift

import { normalizeDataForOrderBookTable, generateMySizeMap, findMidMarket } from './utils';
import { LEVEL_SIDES, AGGREGATION_LEVELS, HEIGHT } from './utils/constants';
import {
  appendPriceIntAndSort,
  convertChangesToLevels,
  levelsHeightAvailable,
  aggPriceLevelBid,
} from './utils/helpers';
import { applyZeroSizeRules } from './utils/adjustBook';
import {
  updateOrInsertBids,
  updateOrInsertAsks,
  insertAllChangesAsLevels,
} from './utils/updateBook';

export const apiCallIds = {
  FETCH_ORDER_BOOK: 'FETCH_ORDER_BOOK',
};

let aggregationLevels = AGGREGATION_LEVELS.slice();

/**
 * ACTION TYPES
 */
const SET_DATA = 'orderBook/SET_DATA';
const UPDATE_DATA = 'orderBook/UPDATE_DATA';
const SET_AGGREGATION = 'orderBook/SET_AGGREGATION';
const INCREMENT_AGGREGATION = 'orderBook/INCREMENT_AGGREGATION';
const DECREMENT_AGGREGATION = 'orderBook/DECREMENT_AGGREGATION';
const TOGGLE_TRADE_ENABLED = 'orderBook/TOGGLE_TRADE_ENABLED';
const SET_STICKY_PRICE = 'orderBook/SET_STICKY_PRICE';
const RECENTER_DEPTH = 'orderBook/RECENTER_DEPTH';

/**
 * ACTIONS
 */
export const setDataAction = createActionCreator(SET_DATA);
export const updateDataAction = createActionCreator(UPDATE_DATA);
export const setAggregationAction = createActionCreator(SET_AGGREGATION);
export const incrementAggregationAction = createActionCreator(INCREMENT_AGGREGATION);
export const decrementAggregationAction = createActionCreator(DECREMENT_AGGREGATION);
export const toggleTradeEnabledAction = createActionCreator(TOGGLE_TRADE_ENABLED);
export const setStickyPriceAction = createActionCreator(SET_STICKY_PRICE);
export const recenterDepthAction = createActionCreator(RECENTER_DEPTH);

/**
 * REDUCERS
 */
const initialState = {
  data: {
    asks: [],
    bids: [],
  },
  aggregation: aggregationLevels[0],
  aggregations: AGGREGATION_LEVELS.slice(),
  tradeEnabled: false, // TODO tradeEnabled should be consumed from TradeMode Context #1577
  stickyPrice: ZERO_SIZE_STRING,
  priceDecimals: PRICE_DECIMALS,
  sizeDecimals: ORDER_SIZE_DECIMALS,
};

const data = createReducer(initialState.data, {
  [SET_DATA]: (_, data) => data,
  [UPDATE_DATA]: ({ asks, bids }, { askChanges, bidChanges }) => ({
    asks: askChanges.length
      ? asks.length
        ? updateOrInsertAsks(askChanges, asks)
        : insertAllChangesAsLevels(askChanges)
      : asks,
    bids: bidChanges.length
      ? bids.length
        ? updateOrInsertBids(bidChanges, bids)
        : insertAllChangesAsLevels(bidChanges)
      : bids,
  }),
});

const aggregation = createReducer(initialState.aggregation, {
  [SET_DATA]: (_, { aggregation }) => aggregation,
  [SET_AGGREGATION]: (_, aggregation) => aggregation,
  [INCREMENT_AGGREGATION]: state =>
    aggregationLevels[aggregationLevels.indexOf(state) + 1] || state,
  [DECREMENT_AGGREGATION]: state =>
    aggregationLevels[aggregationLevels.indexOf(state) - 1] || state,
});

const aggregations = createReducer(initialState.aggregations, {
  [SET_DATA]: (_, { aggregations }) => aggregations,
});

const tradeEnabled = createReducer(initialState.tradeEnabled, {
  [TOGGLE_TRADE_ENABLED]: tradeEnabled => !tradeEnabled,
});

const stickyPrice = createReducer(initialState.stickyPrice, {
  [SET_DATA]: (_, data) => findMidMarket(data),
  [SET_STICKY_PRICE]: (_, stickyPrice) => stickyPrice,
});

const priceDecimals = createReducer(initialState.priceDecimals, {
  [SET_DATA]: (_, { priceDecimals }) => priceDecimals,
});

const sizeDecimals = createReducer(initialState.sizeDecimals, {
  [SET_DATA]: (_, { sizeDecimals }) => sizeDecimals,
});

export default combineReducers({
  data,
  aggregation,
  aggregations,
  tradeEnabled,
  stickyPrice,
  priceDecimals,
  sizeDecimals,
});

/**
 * SELECTORS
 */
export const selectOrderBook = state => state.orderBook;

export const selectOrderBookRawData = state => selectOrderBook(state).data;
export const selectAggregation = state => selectOrderBook(state).aggregation;
export const selectAggregations = state => selectOrderBook(state).aggregations;
export const selectTradeEnabled = state => selectOrderBook(state).tradeEnabled;
export const selectStickyPrice = state => selectOrderBook(state).stickyPrice;
export const selectPriceDecimals = state => selectOrderBook(state).priceDecimals;
export const selectSizeDecimals = state => selectOrderBook(state).sizeDecimals;

export const selectOrderBookData = createMarkedSelector(
  'selectOrderBookData',
  selectOrderBookRawData,
  selectPriceDecimals,
  (orderBookRawData, priceDecimals) => applyZeroSizeRules(orderBookRawData, { priceDecimals })
);

export const selectLevelsPerSide = createMarkedSelector(
  'selectLevelsPerSide',
  selectLayout,
  selectTradeEnabled,
  (layout, tradeEnabled) => {
    const findWidgetConfig = widget => widget.i === widgetConfigIds.OrderBook;
    const widgetConfig =
      layout.find(findWidgetConfig) || layouts.MOBILE.config.find(findWidgetConfig);

    return levelsHeightAvailable(widgetConfig.h, tradeEnabled)
      .dividedToIntegerBy(HEIGHT.ROW)
      .dividedToIntegerBy(2)
      .toNumber();
  }
);

export const selectMyOrderSizes = createMarkedSelector(
  'selectMyOrderSizes',
  selectOpenOrdersFiltered,
  selectAggregation,
  selectPriceDecimals,
  selectTradeEnabled,
  generateMySizeMap
);

export const selectIsMaxAggregation = createMarkedSelector(
  'selectIsMaxAggregation',
  selectAggregation,
  selectAggregations,
  (aggregation, aggregations) => aggregation === aggregations[aggregations.length - 1]
);

export const selectIsMinAggregation = createMarkedSelector(
  'selectIsMinAggregation',
  selectAggregation,
  selectAggregations,
  (aggregation, aggregations) => aggregation === aggregations[0]
);

export const selectStickyPriceWithAgg = createMarkedSelector(
  'selectStickyPriceWithAgg',
  selectStickyPrice,
  selectAggregation,
  selectPriceDecimals,
  aggPriceLevelBid
);

export const selectOrderBookLevels = createMarkedSelector(
  'selectOrderBookLevels',
  selectOrderBookData,
  selectMyOrderSizes,
  selectAggregation,
  selectLevelsPerSide,
  selectTradeEnabled,
  selectStickyPriceWithAgg,
  selectPriceDecimals,
  normalizeDataForOrderBookTable
);

export const selectTradableOrderBookLevels = createMarkedSelector(
  'selectTradableOrderBookLevels',
  selectOrderBookLevels,
  ({ asks, spread, bids }) => [...asks, ...spread, ...bids]
);

export const selectMidMarket = createMarkedSelector(
  'selectMidMarket',
  selectOrderBookData,
  selectAggregation,
  selectPriceDecimals,
  selectLevelsPerSide,
  (data, aggregation, priceDecimals, levelsPerSide) =>
    findMidMarket({ ...data, aggregation, priceDecimals, levelsPerSide })
);

export const selectCanRecenter = createMarkedSelector(
  'selectCanRecenter',
  selectStickyPriceWithAgg,
  selectMidMarket,
  (stickyPrice, midMarket) => stickyPrice !== midMarket
);

export const selectOrderBookIsEmpty = createMarkedSelector(
  'selectOrderBookIsEmpty',
  selectOrderBookLevels,
  ({ asks, bids }) => !asks.length && !bids.length
);

export const selectOrderBookContract = createMarkedSelector(
  'selectOrderBookContract',
  selectGlobalContractCode,
  selectPriceDecimals,
  selectSizeDecimals,
  (contractCode, priceDecimals, sizeDecimals) => ({ contractCode, sizeDecimals, priceDecimals })
);

/**
 * SAGAS
 */
function* showSpinner() {
  yield put(startApiCall({ apiCallId: apiCallIds.FETCH_ORDER_BOOK }));
}

function* hideSpinner() {
  yield put(finishApiCall({ apiCallId: apiCallIds.FETCH_ORDER_BOOK }));
}

function* setStickyPrice() {
  const tradeModeEnabled = yield select(selectTradeEnabled);

  if (tradeModeEnabled) {
    const midMarket = yield select(selectMidMarket);
    yield put(setStickyPriceAction(midMarket));
  }
}

function* receiveMessage({ payload }) {
  const { channel, type, data = {} } = transformDataMessage(payload);

  const globalContractCode = yield select(selectGlobalContractCode);

  if (channel === WS_CHANNELS.LEVEL2 && data.contractCode === globalContractCode) {
    if (type === WS_DATA_TYPES.SNAPSHOT) {
      const priceDecimals = yield select(selectGlobalContractPriceDecimals);
      const sizeDecimals = yield select(selectGlobalContractSizeDecimals);
      const aggregation = yield select(selectGlobalContractTickSize);
      const levelsPerSide = yield select(selectLevelsPerSide);

      const aggregations = [...AGGREGATION_LEVELS];
      if (aggregation < aggregations[0]) {
        // insert new levels at start
        if (aggregations[0] > aggregation) {
          aggregations.unshift(aggregation);
        }
      } else if (aggregation > aggregations[0]) {
        // remove invalid aggregations at start
        const firstValid = aggregations.findIndex(agg => agg >= aggregation);
        if (firstValid > 0) {
          aggregations.splice(0, firstValid);
          if (aggregations[0] > aggregation) {
            aggregations.unshift(aggregation);
          }
        }
      }

      yield put(
        setDataAction({
          ...appendPriceIntAndSort(data),
          priceDecimals,
          sizeDecimals,
          aggregation,
          aggregations,
          levelsPerSide,
        })
      );

      aggregationLevels = aggregations;

      yield hideSpinner();
    } else {
      if (data.changes.length > 0) {
        yield put(
          updateDataAction({
            askChanges: convertChangesToLevels(data.changes, LEVEL_SIDES.ASK),
            bidChanges: convertChangesToLevels(data.changes, LEVEL_SIDES.BID),
          })
        );
      }
    }
  }
}

export function* orderBookSaga() {
  yield showSpinner();

  yield takeEvery(RECEIVE_MESSAGE, receiveMessage); // TODO refactor

  yield takeEvery(TOGGLE_TRADE_ENABLED, setStickyPrice);
  yield takeEvery(RECENTER_DEPTH, setStickyPrice);
}
