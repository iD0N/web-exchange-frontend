import { combineReducers } from 'redux';
import { takeLatest, takeEvery, call, put, select } from 'redux-saga/effects';
import BigNumber from 'bignumber.js';
import moment from 'moment';

import { ORDER_SIDE, ORDER_TYPE } from '../../../../common/enums';
import { startApiCall, finishApiCall } from '../../../../common/services/spinner';
import { selectIsLoggedIn } from '../../../../common/services/user';
import {
  findInArray,
  replaceInArray,
  removeFromArray,
  createMarkedSelector,
} from '../../../../common/utils/reduxHelpers';
import { WS_CHANNELS, WS_DATA_TYPES, WS_MESSAGE_TYPES } from '../../constants';
import {
  sendMessageAction,
  RECEIVE_MESSAGE,
  UPDATE_ACTIVITY_PERIOD_KEY,
  SOFT_RELOAD_APP,
} from '../../../../common/services/webSocket';
import {
  createReducer,
  createActionCreator,
  createApiActionCreators,
  createActionType,
  REQUEST,
  SUCCESS,
} from '../../../../common/utils/reduxHelpers';
import {
  selectContractByCode,
  selectGlobalContractCode,
  selectContracts,
} from '../../data-store/ducks';
import { selectQuantityEstimateFactory } from '../order-entry/ducks';
import { normalizeOrder } from '../order-entry/utils';
import { SIZE_TYPE } from '../order-entry/constants';

import api, { apiCallIds } from './api';
import { ORDER_STATUS, ORDER_ACTION, TABLE_TARGET, TABS } from './constants';
import { isOfMarketOrderType, ensureRequiredFields, isValidAction, normalizeOrders } from './utils';

/**
 * ACTION TYPES
 */
export const INITIALIZE_ORDERS = 'orders/INITIALIZE_ORDERS';
export const UPDATE_ORDERS = 'orders/UPDATE_ORDERS';
export const CANCEL_ORDER = 'orders/CANCEL_ORDER';
export const REMOVE_ORDER = 'orders/REMOVE_ORDER';
export const MODIFY_ORDER = 'orders/MODIFY_ORDER';

export const FETCH_OPEN_ORDERS = 'orders/FETCH_OPEN_ORDERS';

export const FETCH_ORDER_HISTORY = 'orders/FETCH_ORDER_HISTORY';
export const UPDATE_ORDER_HISTORY = 'orders/UPDATE_ORDER_HISTORY';

export const FETCH_ORDER_FILLS = 'orders/FETCH_ORDER_FILLS';
export const UPDATE_FILLS = 'orders/UPDATE_FILLS';

export const RESET_LOADED = 'orders/RESET_LOADED';

/**
 * ACTIONS
 */
export const initializeOrdersAction = createActionCreator(INITIALIZE_ORDERS);
export const updateOrdersAction = createActionCreator(UPDATE_ORDERS);
export const cancelOrderAction = createActionCreator(CANCEL_ORDER);
export const removeOpenOrderAction = createActionCreator(REMOVE_ORDER);
export const modifyOpenOrderAction = createActionCreator(MODIFY_ORDER);

export const fetchOpenOrdersAction = createApiActionCreators(FETCH_OPEN_ORDERS);
export const fetchOrderHistoryActions = createApiActionCreators(FETCH_ORDER_HISTORY);
export const updateOrderHistoryAction = createActionCreator(UPDATE_ORDER_HISTORY);

export const fetchOrderFillsActions = createApiActionCreators(FETCH_ORDER_FILLS);
export const updateFillsAction = createActionCreator(UPDATE_FILLS);

export const resetLoadedAction = createActionCreator(RESET_LOADED);

let snapshotReceived = false;
/**
 * REDUCERS
 */
const initialState = {
  openOrders: [],
  orderHistory: [],
  orderFills: [],
  loaded: {
    [TABS.ORDERS]: false,
    [TABS.ORDER_HISTORY]: false,
    [TABS.FILLS]: false,
  },
};

const updateOrAddOrder = (orderList, payload, target) => {
  const existingOrder = findInArray(orderList, orderIdMatcher(payload.orderId));

  if (existingOrder) {
    return replaceInArray(
      orderList,
      orderIdMatcher(payload.orderId),
      ensureRequiredFields({
        ...payload,
        persistInTable: payload.persistInTable || existingOrder.persistInTable || false,
        createdAt: existingOrder.createdAt,
        status:
          // if this order is already canceled, the fill will show "accepted", so override when updating
          existingOrder.canceledAt && moment(payload.createdAt).isBefore(existingOrder.canceledAt)
            ? ORDER_STATUS.CANCELED
            : payload.status,
      })
    );
  }

  if (target === TABLE_TARGET.OPEN && payload.status === ORDER_STATUS.CANCELED) {
    // no row for this order in open orders table, so do not add it
    return orderList;
  }

  const { createdAt, persistInTable = false, timestamp } = payload;
  return [
    ensureRequiredFields({
      ...payload,
      persistInTable,
      createdAt: createdAt || timestamp,
    }),
    ...orderList,
  ];
};

const openOrders = createReducer(initialState.openOrders, {
  [INITIALIZE_ORDERS]: (state, { orders, contracts }) => normalizeOrders(orders, contracts),
  [UPDATE_ORDERS]: (state, order) => updateOrAddOrder(state, order, TABLE_TARGET.OPEN),
  [REMOVE_ORDER]: (state, orderId) => removeFromArray(state, orderIdMatcher(orderId)),
});

const orderHistory = createReducer(initialState.orderHistory, {
  [FETCH_ORDER_HISTORY]: {
    [SUCCESS]: (state, orders) => orders,
  },
  [UPDATE_ORDER_HISTORY]: (state, order) => updateOrAddOrder(state, order, TABLE_TARGET.HISTORY),
});

const orderFills = createReducer(initialState.orderFills, {
  [FETCH_ORDER_FILLS]: {
    [SUCCESS]: (state, fills) =>
      fills.map(fill => ({
        ...fill,
        quantity: BigNumber(fill.quantity)
          .abs()
          .toString(),
      })),
  },
  [UPDATE_FILLS]: (state, update) => [
    {
      ...update,
      price: update.fillPrice,
      rowKey: `${update.orderId}_${update.timestamp}_${update.quantity}`,
      fee: update.fillFeesDelta,
      quantity: BigNumber(update.sizeFilledDelta)
        .abs()
        .toNumber(),
    },
    ...state,
  ],
});

const loaded = createReducer(initialState.loaded, {
  [INITIALIZE_ORDERS]: (state, { orders, contractsMetadata }) =>
    !state[TABS.ORDERS] ? { ...state, [TABS.ORDERS]: true } : state,
  [FETCH_ORDER_HISTORY]: {
    [SUCCESS]: state =>
      !state[TABS.ORDER_HISTORY] ? { ...state, [TABS.ORDER_HISTORY]: true } : state,
  },
  [FETCH_ORDER_FILLS]: {
    [SUCCESS]: state => (!state[TABS.FILLS] ? { ...state, [TABS.FILLS]: true } : state),
  },
  [RESET_LOADED]: _ => ({ ...initialState.loaded }),
});

export default combineReducers({
  openOrders,
  orderHistory,
  orderFills,
  loaded,
});

/**
 * SELECTORS
 */
export const selectOrders = state => state.orders;

export const selectOpenOrders = state => selectOrders(state).openOrders;
export const selectOrderHistory = state => selectOrders(state).orderHistory;
export const selectOrderFills = state => selectOrders(state).orderFills;
export const selectLoaded = state => selectOrders(state).loaded;

export const selectIsTabLoaded = createMarkedSelector(
  'selectIsTabLoaded',
  selectLoaded,
  (_, tab) => tab,
  (loaded, tab) => !!loaded[tab]
);

const createFilteredSelector = orderSelector =>
  createMarkedSelector(
    'createFilteredSelector',
    orderSelector,
    selectGlobalContractCode,
    (orders, contractCode) =>
      orders.filter(({ contractCode: orderContractCode }) => orderContractCode === contractCode)
  );

export const selectOpenOrdersFiltered = createFilteredSelector(selectOpenOrders);
export const selectOrderHistoryFiltered = createFilteredSelector(selectOrderHistory);
export const selectOrderFillsFiltered = createFilteredSelector(selectOrderFills);

export const selectOrdersWithContractMetadata = ordersSelector =>
  createMarkedSelector(
    'selectOrdersWithContractMetadata',
    ordersSelector,
    selectContracts,
    (orders, contractMap) => orders.map(addMetadataToOrder(contractMap)),
  );

const addMetadataToOrder = contractMap => order => {
  const contract = contractMap[order.contractCode];
  if (!contract)
    return order;

  const { type: contractType, priceDecimals, quoteCurrency } = contract;
  return { ...order, contractType, priceDecimals, quoteCurrency };
}

// TODO(AustinC): i don't think the memoization isn't helping us here (check usages)
export const selectOpenOrderById = createMarkedSelector(
  'selectOpenOrderById',
  selectOpenOrders,
  (_, orderId) => orderId,
  (openOrders, orderId) => findInArray(openOrders, orderIdMatcher(orderId))
);

export const selectActiveOrders = createMarkedSelector(
  'selectActiveOrders',
  selectOpenOrders,
  orders => orders.filter(({ status }) => status === ORDER_STATUS.ACCEPTED)
);

export const selectMarketOrderSizes = createMarkedSelector(
  'selectMarketOrderSizes',
  selectOpenOrders,
  orders => {
    const dict = {};
    orders
      .filter(
        ({ orderType, status }) =>
          orderType === ORDER_TYPE.MARKET &&
          [ORDER_STATUS.ACCEPTED, ORDER_STATUS.PENDING, ORDER_STATUS.RECEIVED].includes(status)
      )
      .forEach(({ side, size, sizeFilled, contractCode }) => {
        if (!dict[contractCode]) {
          dict[contractCode] = BigNumber(0);
        }
        const adjustedSize = BigNumber(size).minus(sizeFilled || 0);
        dict[contractCode] = dict[contractCode].plus(
          side === ORDER_SIDE.BUY ? adjustedSize : adjustedSize.negated()
        );
      });
    return dict;
  }
);

const closedStatuses = [ORDER_STATUS.CANCELED, ORDER_STATUS.DONE, ORDER_STATUS.REJECTED]

export const selectOpenOrderCount = createMarkedSelector(
  'selectOpenOrderCount',
  selectOpenOrders,
  orders => orders.filter(({ status }) => !closedStatuses.includes(status)).length
);

/**
 * SAGAS
 */
function* cancelOrder({ payload: { orderId, persistInTable } }) {
  const order = yield select(selectOpenOrderById, orderId);

  if (!order) {
    return;
  }

  if (order.status === ORDER_STATUS.CANCELED || order.status === ORDER_STATUS.REJECTED) {
    yield put(removeOpenOrderAction(orderId));
  } else if (order.status === ORDER_STATUS.ACCEPTED || order.status === ORDER_STATUS.PENDING) {
    yield put(
      sendMessageAction({
        channel: WS_CHANNELS.TRADING,
        type: WS_MESSAGE_TYPES.REQUEST,
        action: 'cancel-order',
        data: {
          orderId,
        },
      })
    );
    yield put(updateOrdersAction({ ...order, persistInTable, status: ORDER_STATUS.CANCELLING }));
  }
}

function* initializeOpenOrders() {
  const isLoggedIn = yield select(selectIsLoggedIn);
  if (!isLoggedIn) {
    return;
  }

  if (!snapshotReceived) {
    yield put(startApiCall({ apiCallId: apiCallIds.FETCH_OPEN_ORDERS }));
  }
}

function* initializeOrderFills() {
  const isLoggedIn = yield select(selectIsLoggedIn);
  if (!isLoggedIn) {
    return;
  }

  const resp = yield call(api.fills);

  if (resp.ok) {
    yield put(fetchOrderFillsActions.success(resp.data.fills));
  }
}

function* initializeOrderHistory() {
  const isLoggedIn = yield select(selectIsLoggedIn);
  if (!isLoggedIn) {
    return;
  }

  const resp = yield call(api.orderHistory);

  if (resp.ok) {
    yield put(fetchOrderHistoryActions.success(resp.data.orders));
  }
}

function* handleUpdateMessage({ action, ...data }) {
  const update =
    data.action === ORDER_ACTION.CANCELED ? { ...data, canceledAt: data.createdAt } : data;
  const { status, orderId } = update;
  const order = yield select(selectOpenOrderById, orderId);
  const loaded = yield select(selectLoaded);

  switch (action) {
    case ORDER_ACTION.CANCELED:
      if (order && order.persistInTable) {
        if (loaded[TABS.ORDER_HISTORY]) {
          yield put(updateOrderHistoryAction(update));
        }
      } else {
        yield put(removeOpenOrderAction(orderId));
        return;
      }
      break;
    case ORDER_ACTION.FILLED:
      if (loaded[TABS.FILLS] && order.sizeFilled !== update.sizeFilled) {
        yield put(updateFillsAction(update));
      }

      if (status === ORDER_STATUS.DONE) {
        yield put(removeOpenOrderAction(orderId));
        if (loaded[TABS.ORDER_HISTORY]) {
          yield put(
            updateOrderHistoryAction(order ? { ...update, createdAt: order.createdAt } : update)
          );
        }
        return false;
      }
      break;
    case ORDER_ACTION.CANCEL_REJECTED:
      if (order) {
        yield put(
          updateOrdersAction({
            ...order,
            status: ORDER_STATUS.ACCEPTED,
            action: ORDER_ACTION.ACCEPTED,
          })
        );
      }
      return false;
    case ORDER_ACTION.MODIFY_REJECTED:
      if (order) {
        yield put(updateOrdersAction({ ...order, status: ORDER_STATUS.ACCEPTED }));
      }
      return false;
    case ORDER_ACTION.REJECTED:
      yield put(updateOrdersAction(update));
      return false;
    default:
  }

  yield put(updateOrdersAction(update));
}

function* handleSnapshotMessage(orders) {
  yield put(finishApiCall({ apiCallId: apiCallIds.FETCH_OPEN_ORDERS }));
  const contracts = yield select(selectContracts);
  yield put(initializeOrdersAction({ orders, contracts }));
}

function* receiveMessage({ payload: { channel, type, action, data = {} } }) {
  if (channel === WS_CHANNELS.ORDERS) {
    if (type === WS_DATA_TYPES.UPDATE && isValidAction(action)) {
      const contractsMetadata = yield select(selectContracts);
      yield handleUpdateMessage({ ...ensureRequiredFields(data, contractsMetadata), action });
    } else if (type === WS_DATA_TYPES.SNAPSHOT) {
      snapshotReceived = true;
      yield handleSnapshotMessage(data);
    }
  }
}

const selectQuantityEstimate = selectQuantityEstimateFactory();
function* getModifyOrderSize({ contractCode, notional, type, side, size, sizeType }) {
  if (type === ORDER_TYPE.MARKET && sizeType === SIZE_TYPE.NOTIONAL) {
    const { canBuy, canSell } = yield select(selectQuantityEstimate, contractCode, notional);
    return side === ORDER_SIDE.BUY ? canBuy : canSell;
  } else {
    return size;
  }
}

export function* modifyOrder({ payload: order }) {
  const {
    contractCode,
    notional,
    orderId,
    postOnly,
    price,
    reduceOnly,
    side,
    size,
    sizeType,
    stopPrice,
    stopTrigger,
    stopOrderType,
    trailValue,
    orderType: type,
  } = order;

  const originalOrder = yield select(selectOpenOrderById, orderId);
  yield put(updateOrdersAction({ ...originalOrder, status: ORDER_STATUS.MODIFYING }));

  const orderSize = yield getModifyOrderSize({
    contractCode,
    notional,
    type,
    side,
    size,
    sizeType,
  });

  const { priceDecimals, sizeDecimals } = contractCode
    ? yield select(selectContractByCode, contractCode)
    : undefined;

  const orderData = normalizeOrder({
    contractCode,
    notional,
    orderId,
    postOnly,
    price,
    priceDecimals,
    reduceOnly,
    side,
    size: orderSize,
    sizeType,
    sizeDecimals,
    stopPrice,
    stopTrigger,
    stopOrderType,
    trailValue,
    type,
  });

  if (isOfMarketOrderType(type)) {
    delete orderData.price;
    orderData.postOnly = false;
  }

  yield put(
    sendMessageAction({
      channel: WS_CHANNELS.TRADING,
      type: WS_MESSAGE_TYPES.REQUEST,
      action: 'modify-order',
      data: orderData,
    })
  );
}

export function unsetSnapshotReceived() {
  snapshotReceived = false;
}

export function* unsetOrders() {
  unsetSnapshotReceived();
  yield put(fetchOpenOrdersAction.success([]));
  yield put(fetchOrderHistoryActions.success([]));
  yield put(updateOrderHistoryAction([]));
  yield put(resetLoadedAction());
}

export function* ordersSaga() {
  yield takeLatest(createActionType(FETCH_OPEN_ORDERS, REQUEST), initializeOpenOrders);
  yield takeLatest(createActionType(FETCH_ORDER_HISTORY, REQUEST), initializeOrderHistory);
  yield takeLatest(createActionType(FETCH_ORDER_FILLS, REQUEST), initializeOrderFills);
  yield takeEvery(CANCEL_ORDER, cancelOrder);
  yield takeEvery(MODIFY_ORDER, modifyOrder);
  yield takeEvery(RECEIVE_MESSAGE, receiveMessage); // TODO refactor
  yield takeEvery(UPDATE_ACTIVITY_PERIOD_KEY, unsetSnapshotReceived);
  yield takeEvery(SOFT_RELOAD_APP, unsetOrders);
}

/**
 * HELPERS
 */
const orderIdMatcher = selectOrderId => ({ orderId }) => orderId === selectOrderId;
