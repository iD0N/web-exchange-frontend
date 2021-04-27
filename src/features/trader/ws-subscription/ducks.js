import { combineReducers } from 'redux';
import { takeEvery, put, select, all } from 'redux-saga/effects';
import { createSelector } from 'reselect';

import { selectIsLoggedIn } from '../../../common/services/user';
import {
  createActionCreator,
  createReducer,
  createActionType,
  SUCCESS,
} from '../../../common/utils/reduxHelpers';
import {
  sendMessageAction,
  OPEN_SOCKET,
  selectPending,
  selectIsOpen,
} from '../../../common/services/webSocket';
import { WS_PRIVATE_CHANNELS } from '../constants';

import {
  constructKey,
  deconstructKey,
  buildSubscribeMessage,
  buildUnsubscribeMessage,
  compareSubscribeMessage,
} from './helpers';

/**
 * ACTION TYPES
 */
export const SUBSCRIBE = 'traderWebSocket/SUBSCRIBE';
export const UNSUBSCRIBE = 'traderWebSocket/UNSUBSCRIBE';
export const SET_SUBSCRIBE = 'traderWebSocket/SET_SUBSCRIBE';
export const SET_UNSUBSCRIBE = 'traderWebSocket/SET_UNSUBSCRIBE';

/**
 * ACTIONS
 */
export const subscribeAction = createActionCreator(SUBSCRIBE);
export const unsubscribeAction = createActionCreator(UNSUBSCRIBE);
export const setSubscribeAction = createActionCreator(SET_SUBSCRIBE);
export const setUnsubscribeAction = createActionCreator(SET_UNSUBSCRIBE);

/**
 * REDUCERS
 */
const initialState = {
  subscriptions: {},
};

const subscriptions = createReducer(initialState.subscriptions, {
  [SET_SUBSCRIBE]: (state, key) => ({
    ...state,
    [key]: state[key] ? state[key] + 1 : 1,
  }),
  [SET_UNSUBSCRIBE]: (state, key) => ({
    ...state,
    [key]: state[key] > 1 ? state[key] - 1 : 0,
  }),
});

export default combineReducers({
  subscriptions,
});

/**
 * SELECTORS
 */
export const selectTraderWebSocket = state => state.traderWebSocket;

export const selectSubscriptions = state => selectTraderWebSocket(state).subscriptions;

export const selectSubscriptionsByKey = (state, key) => selectSubscriptions(state)[key];

export const selectActiveSubscriptionKeys = createSelector(selectSubscriptions, subscriptions =>
  Object.entries(subscriptions)
    .filter(([key, value]) => value)
    .map(([key]) => key)
);

export const selectMissingSubscriptions = createSelector(
  selectPending,
  selectActiveSubscriptionKeys,
  (pendingMessages, subscriptionKeys) =>
    subscriptionKeys.reduce((arr, key) => {
      const [channel, contractCode] = deconstructKey(key);

      const alreadyPending = pendingMessages.find(message =>
        compareSubscribeMessage(message, channel, contractCode)
      );

      return alreadyPending ? arr : [...arr, { channel, contractCode }];
    }, [])
);

/**
 * SAGAS
 */
function* subscribe({ payload, payload: { channel, contractCode, forceResubscribe } }) {
  if (WS_PRIVATE_CHANNELS.includes(channel)) {
    const isLoggedIn = yield select(selectIsLoggedIn);
    if (!isLoggedIn) {
      return;
    }
  }

  const key = constructKey(channel, contractCode);

  yield put(setSubscribeAction(key));

  const count = yield select(selectSubscriptionsByKey, key);
  if (forceResubscribe && count > 1) {
    yield unsubscribe({ payload });
  }

  if (count === 1 || forceResubscribe) {
    yield put(sendMessageAction(buildSubscribeMessage(channel, contractCode)));
    return;
  }
}

function* unsubscribe({ payload: { channel, contractCode, forceResubscribe } }) {
  const key = constructKey(channel, contractCode);

  yield put(setUnsubscribeAction(key));

  const count = yield select(selectSubscriptionsByKey, key);

  if (count === 0 || forceResubscribe) {
    const isOpen = yield select(selectIsOpen);

    if (isOpen) {
      yield put(sendMessageAction(buildUnsubscribeMessage(channel, contractCode)));
    }
  }
}

function* resubscribe() {
  const subscribeMessages = yield select(selectMissingSubscriptions);

  yield all(
    subscribeMessages.map(({ channel, contractCode }) =>
      put(sendMessageAction(buildSubscribeMessage(channel, contractCode)))
    )
  );
}

export function* traderWebSocketSaga() {
  yield takeEvery(SUBSCRIBE, subscribe);
  yield takeEvery(UNSUBSCRIBE, unsubscribe);
  yield takeEvery(createActionType(OPEN_SOCKET, SUCCESS), resubscribe);
}
