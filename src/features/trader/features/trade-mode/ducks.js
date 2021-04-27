import { all, call, put, select, takeEvery } from 'redux-saga/effects';
import { createSelector } from 'reselect';
import BigNumber from 'bignumber.js';

import { logEventAction } from '../../../../common/services/eventLogger';
import { EVENT_ACTIONS, EVENT_TYPES } from '../../../../common/services/eventLogger/constants';
import { ORDER_SIDE, ORDER_TYPE } from '../../../../common/enums';
import { toQuantityString } from '../../../../common/utils/numberHelpers';
import { createActionCreator } from '../../../../common/utils/reduxHelpers';

import { selectGlobalContractCode, selectGlobalContract } from '../../data-store/ducks';
import { selectPosition } from '../positions/ducks'; // TODO uplift
import { selectActiveOrders, cancelOrderAction, modifyOpenOrderAction } from '../orders/ducks'; // TODO uplift
import { submitOrderAction } from '../order-entry/ducks'; // TODO uplift
import { selectAggregation, selectPriceDecimals } from '../order-book/ducks'; // TODO uplift
import { aggPriceLevelBid, aggPriceLevelAsk } from '../order-book/utils/helpers'; // TODO uplift
import { selectMaxBuySellFactory } from '../account-summary/ducks'; // TODO uplift

import { PRESET_TRADABLE_QUANTITIES } from './constants';

/**
 * ACTION TYPES
 */
export const CANCEL_ORDERS_IN_LEVEL = 'tradeMode/CANCEL_ORDERS_IN_LEVEL';
export const CANCEL_ORDERS_BY_SIDE = 'tradeMode/CANCEL_ORDERS_OF_SIDE';
export const CANCEL_ORDERS_BY_IDS = 'tradeMode/CANCEL_ORDERS_BY_IDS';
export const CLOSE_POSITION = 'tradeMode/CLOSE_POSITION';
export const UPDATE_ORDER_PRICE_IN_LEVEL = 'tradeMode/UPDATE_ORDER_PRICE_IN_LEVEL';
export const UPDATE_ORDER_LEVEL = 'tradeMode/UPDATE_ORDER_LEVEL';

/**
 * ACTIONS
 */
export const cancelOrdersInLevelAction = createActionCreator(CANCEL_ORDERS_IN_LEVEL);
export const cancelOrdersBySideAction = createActionCreator(CANCEL_ORDERS_BY_SIDE);
export const cancelOrdersByIdsAction = createActionCreator(CANCEL_ORDERS_BY_IDS);
export const closePositionAction = createActionCreator(CLOSE_POSITION);
export const updateOrderPriceInLevelAction = createActionCreator(UPDATE_ORDER_PRICE_IN_LEVEL);
export const updateOrderLevelAction = createActionCreator(UPDATE_ORDER_LEVEL);

/**
 * SELECTORS
 */

const selectMaxBuySell = selectMaxBuySellFactory();

const selectMaxOfMaxBuySell = createSelector(
  selectGlobalContract,
  selectMaxBuySell, // requires prop: contractCode  
  ({ sizeDecimals }, { quantity: { buy, sell } }) => {
    // console.log({location: 'in selectMaxofBuySell', sizeDecimals, buy, sell})
    if ((Number.isNaN(buy) && Number.isNaN(sell)) || !sizeDecimals) {
      return 0;
    }
    return BigNumber.maximum(buy, sell)
      .dp(sizeDecimals)
      .toNumber();
  }
);

export const selectTradeModeDefault = createSelector(
  selectMaxOfMaxBuySell, // requires prop: contractCode
  max =>
    Number.isNaN(max)
      ? NaN
      : BigNumber(max)
          .multipliedBy(0.05)
          .dp(2)
          .toNumber()
);

export const selectTradeModeSizes = createSelector(
  selectGlobalContract,
  selectMaxOfMaxBuySell, // requires prop: contractCode
  ({ sizeDecimals }, max) => {
    return PRESET_TRADABLE_QUANTITIES.map(percent => ({
      quantity: BigNumber(percent).dividedBy(100).multipliedBy(max).dp(sizeDecimals).toNumber(),
      label: `${percent}%`,
    }));
  }
);

/**
 * HELPERS
 */
function* filterActiveOrders(filterFn) {
  const activeOrders = yield select(selectActiveOrders);

  return activeOrders.filter(filterFn);
}

function* getOrdersInLevel(side, priceLevel, type) {
  const aggregation = yield select(selectAggregation);
  const priceDecimals = yield select(selectPriceDecimals);
  const globalContractCode = yield select(selectGlobalContractCode);
  const coercePriceToLevel =
    side === (type === ORDER_TYPE.STOP_MARKET ? ORDER_SIDE.SELL : ORDER_SIDE.BUY)
      ? aggPriceLevelBid
      : aggPriceLevelAsk;

  return yield call(
    filterActiveOrders,
    ({ side: orderSide, price, stopPrice, contractCode, orderType, pegPriceType }) =>
      contractCode === globalContractCode &&
      !pegPriceType &&
      orderSide === side &&
      orderType === type &&
      coercePriceToLevel(
        type === ORDER_TYPE.LIMIT ? price : stopPrice,
        aggregation,
        priceDecimals
      ) === priceLevel
  );
}
/*
function pause(delayMs) {
  return new Promise(resolve => {
    setTimeout(_ => {
      resolve();
    }, delayMs);
  });
}
*/
/**
 * SAGAS
 */
function* cancelOrdersBySide({ payload: { side, contractCode } }) {
  const ordersToCancel = yield call(
    filterActiveOrders,
    ({ contractCode: orderContractCode, side: orderSide }) =>
      (!contractCode || orderContractCode === contractCode) && (!side || orderSide === side)
  );

  yield all(ordersToCancel.map(({ orderId }) => put(cancelOrderAction({ orderId }))));
}

function* cancelOrdersByIds({ payload: { orderIds } }) {
  yield all(orderIds.map(orderId => put(cancelOrderAction({ orderId }))));
}

function* cancelOrdersInLevel({ payload: { priceLevel, side, type } }) {
  const ordersToCancel = yield call(getOrdersInLevel, side, priceLevel, type);

  yield all(ordersToCancel.map(({ orderId }) => put(cancelOrderAction({ orderId }))));
}

function* handleClosePosition({ payload: { contractCode, widget } }) {
  //yield cancelOrdersBySide({ payload: { contractCode } });
  //yield call(pause, 500);
  yield handleZeroOutPosition({ contractCode, widget });
}

function* handleZeroOutPosition({ contractCode, widget }) {
  const position = yield select(selectPosition, contractCode);
  const { quantity } = position;
  if (widget) {
    yield put(
      logEventAction({
        action: EVENT_ACTIONS.CLOSE_POSITION_CONFIRM,
        isMobile: false,
        position,
        type: EVENT_TYPES.CLICK,
        widget,
      })
    );
  }
  const side = BigNumber(quantity).isPositive() ? ORDER_SIDE.SELL : ORDER_SIDE.BUY;

  if (BigNumber(quantity).isZero()) {
    return;
  }

  yield put(
    submitOrderAction({
      contractCode,
      side,
      size: toQuantityString(BigNumber(quantity).absoluteValue()),
      type: ORDER_TYPE.MARKET,
      reduceOnly: true,
    })
  );
}

function* updateOrderPriceInLevel({ payload: { orders, price, stopPrice } }) {
  const type = orders[0].orderType;
  yield all(
    orders.map(order =>
      put(
        modifyOpenOrderAction({
          ...order,
          ...(type === ORDER_TYPE.LIMIT ? { price } : { stopPrice: stopPrice || price }),
        })
      )
    )
  );
}

function* updateOrderLevel({ payload: { side, currLevelPrice, nextLevelPrice, type } }) {
  const orders = yield call(getOrdersInLevel, side, currLevelPrice, type);

  yield put(updateOrderPriceInLevelAction({ orders, price: nextLevelPrice }));
}

export function* tradeModeSaga() {
  yield takeEvery(CANCEL_ORDERS_IN_LEVEL, cancelOrdersInLevel);
  yield takeEvery(CANCEL_ORDERS_BY_SIDE, cancelOrdersBySide);
  yield takeEvery(CANCEL_ORDERS_BY_IDS, cancelOrdersByIds);
  yield takeEvery(CLOSE_POSITION, handleClosePosition);
  yield takeEvery(UPDATE_ORDER_PRICE_IN_LEVEL, updateOrderPriceInLevel);
  yield takeEvery(UPDATE_ORDER_LEVEL, updateOrderLevel);
}
