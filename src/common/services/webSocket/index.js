import { combineReducers } from 'redux';
import { eventChannel } from 'redux-saga';
import {
  call,
  take,
  takeEvery,
  takeLatest,
  race,
  all,
  put,
  select,
  fork,
  delay,
} from 'redux-saga/effects';
import { isMobile } from 'react-device-detect';

import {
  createActionCreator,
  createApiActionCreators,
  createReducer,
  createActionType,
  SUCCESS,
  REQUEST,
} from '../../utils/reduxHelpers';
import { LOGIN, selectIsLoggedIn } from '../user';
import { logEventAction } from '../eventLogger';
import { EVENT_ACTIONS, EVENT_TYPES } from '../eventLogger/constants';
import { resetApiCallsAction } from '../spinner';

import { CONNECTION_STATUS, DEFAULT_OPTIONS } from './constants';
import { getAuthTokens, parseMessageData, stringifyMessageData, initBackoff } from './utils';

const backoff = initBackoff();

/**
 * ACTION TYPES
 */
export const OPEN_SOCKET = 'webSocket/OPEN_SOCKET';
export const CLOSE_SOCKET = 'webSocket/CLOSE_SOCKET';
export const FORCE_CLOSE_SOCKET = 'webSocket/FORCE_CLOSE_SOCKET';
export const SEND_MESSAGE = 'webSocket/SEND_MESSAGE';
export const RECEIVE_MESSAGE = 'webSocket/RECEIVE_MESSAGE';
export const ADD_PENDING = 'webSocket/ADD_PENDING';
export const CLEAR_PENDING = 'webSocket/CLEAR_PENDING';
export const SET_NEXT_RECONNECT = 'webSocket/SET_NEXT_RECONNECT';
export const UPDATE_ACTIVITY_PERIOD_KEY = 'webSocket/UPDATE_ACTIVITY_PERIOD_KEY';
export const UPDATE_APP_RENDERED = 'webSocket/UPDATE_APP_RENDERED';
export const SOFT_RELOAD_APP = 'webSocket/SOFT_RELOAD_APP';

/**
 * ACTIONS
 */
export const openSocketActions = createApiActionCreators(OPEN_SOCKET);
export const closeSocketAction = createActionCreator(CLOSE_SOCKET);
export const forceCloseSocketAction = createActionCreator(FORCE_CLOSE_SOCKET);
export const sendMessageAction = createActionCreator(SEND_MESSAGE);
export const receiveMessageAction = createActionCreator(RECEIVE_MESSAGE);
export const addPendingAction = createActionCreator(ADD_PENDING);
export const clearPendingAction = createActionCreator(CLEAR_PENDING);
export const setNextReconnectAction = createActionCreator(SET_NEXT_RECONNECT);
export const updateActivityPeriodKeyAction = createActionCreator(UPDATE_ACTIVITY_PERIOD_KEY);
export const updateAppRenderedAction = createActionCreator(UPDATE_APP_RENDERED);
export const softReloadAppAction = createActionCreator(SOFT_RELOAD_APP);

let lastMessageReceived = Date.now();

const MINUTE = 1000 * 60;
const IDLE_MAX_DURATION = MINUTE * 30;
// 30 minutes from last activity received from user to consider IDLE.

/**
 * REDUCERS
 */
const initialState = {
  status: CONNECTION_STATUS.CLOSED,
  pending: [],
  options: DEFAULT_OPTIONS,
  nextReconnect: null,
  activityPeriodKey: 1,
  appRendered: true,
};

const status = createReducer(initialState.status, {
  [OPEN_SOCKET]: {
    [REQUEST]: () => CONNECTION_STATUS.CONNECTING,
    [SUCCESS]: () => CONNECTION_STATUS.OPEN,
  },
  [CLOSE_SOCKET]: () => CONNECTION_STATUS.CLOSED,
  [FORCE_CLOSE_SOCKET]: () => CONNECTION_STATUS.CLOSED,
});

const pending = createReducer(initialState.pending, {
  [ADD_PENDING]: (state, message) => [...state, message],
  [CLEAR_PENDING]: () => initialState.pending,
  [FORCE_CLOSE_SOCKET]: () => initialState.pending,
});

const options = createReducer(initialState.options, {
  [OPEN_SOCKET]: {
    [REQUEST]: (state, payload = {}) => ({ ...state, ...payload }),
  },
  [FORCE_CLOSE_SOCKET]: () => initialState.options,
});

const nextReconnect = createReducer(initialState.nextReconnect, {
  [SET_NEXT_RECONNECT]: (state, nextReconnect) => nextReconnect,
  [OPEN_SOCKET]: {
    [SUCCESS]: () => initialState.nextReconnect,
  },
  [FORCE_CLOSE_SOCKET]: () => initialState.nextReconnect,
});

const activityPeriodKey = createReducer(initialState.activityPeriodKey, {
  [UPDATE_ACTIVITY_PERIOD_KEY]: state => state + 1,
});

const appRendered = createReducer(initialState.appRendered, {
  [UPDATE_APP_RENDERED]: (state, isRendered) => isRendered,
});

export default combineReducers({
  status,
  pending,
  options,
  nextReconnect,
  activityPeriodKey,
  appRendered,
});

/**
 * SELECTORS
 */
export const selectWebSocket = state => state.webSocket;

export const selectStatus = state => selectWebSocket(state).status;
export const selectPending = state => selectWebSocket(state).pending;
export const selectOptions = state => selectWebSocket(state).options;
export const selectNextReconnect = state => selectWebSocket(state).nextReconnect;
export const selectActivityPeriodKey = state => selectWebSocket(state).activityPeriodKey;
export const selectAppRendered = state => selectWebSocket(state).appRendered;

export const selectIsConnecting = state => selectStatus(state) === CONNECTION_STATUS.CONNECTING;
export const selectIsOpen = state => selectStatus(state) === CONNECTION_STATUS.OPEN;
export const selectIsClosed = state => selectStatus(state) === CONNECTION_STATUS.CLOSED;

/**
 * SAGAS
 */
function* reconnectDelay() {
  const delayMs = backoff.next();

  const nextReconnect = new Date(new Date().getTime() + delayMs).toISOString();

  yield put(setNextReconnectAction(nextReconnect));

  yield delay(delayMs);
}

function* watchHeartbeat(socketChannel) {
  const { reconnectionTimeout } = yield select(selectOptions);

  while (true) {
    const { timeout } = yield race({
      heartbeat: take(RECEIVE_MESSAGE),
      timeout: delay(reconnectionTimeout),
    });

    if (timeout) {
      return true;
    }
  }
}

function* sendMessage(socket) {
  yield takeEvery(SEND_MESSAGE, function*({ payload: data }) {
    const isOpen = yield select(selectIsOpen);

    if (isOpen) {
      const tokens = yield select(selectIsLoggedIn) ? yield call(getAuthTokens) : {};
      if (data.isPrivate && !tokens.accessToken) {
        yield put(addPendingAction(data));
        return;
      }
      socket.send(stringifyMessageData({ ...data, ...tokens }));
      if (data.type && !['subscribe', 'unsubscribe'].includes(data.type)) {
        yield put(
          logEventAction({
            action: EVENT_ACTIONS.SEND_MESSAGE,
            type: EVENT_TYPES.SOCKET_MESSAGE,
            message: data,
          })
        );
      }
    }
  });
}

function* handleEvent(socketChannel) {
  while (true) {
    const e = yield take(socketChannel);

    if (e instanceof MessageEvent) {
      const now = Date.now();
      const sinceLastActive = now - lastMessageReceived;
      if (sinceLastActive > IDLE_MAX_DURATION) {
        lastMessageReceived = now;
        if (isMobile) {
          yield put(softReloadAppAction());
        } else {
          yield put(updateActivityPeriodKeyAction());
        }
      } else {
        lastMessageReceived = now;
        yield put(receiveMessageAction(parseMessageData(e)));
      }
    } else if (e instanceof CloseEvent) {
      yield put(closeSocketAction());
    } else if (e instanceof ErrorEvent) {
      console.error(e);
    } else if (e.type === 'open') {
      backoff.reset();
      yield put(openSocketActions.success());
    }
  }
}

const createSocketChannel = socket =>
  eventChannel(emit => {
    socket.onopen = emit;
    socket.onmessage = emit;
    socket.onclose = emit;
    socket.onerror = emit;

    return () => socket.close();
  });

function* addToPending({ payload }) {
  const isOpen = yield select(selectIsOpen);

  if (!isOpen) {
    yield put(addPendingAction(payload));
  }
}

function* sendPending() {
  const isOpen = yield select(selectIsOpen);
  if (!isOpen) {
    return;
  }

  const pending = yield select(selectPending);

  yield put(clearPendingAction());

  yield all(pending.map(message => put(sendMessageAction(message))));
}

function pause(delayMs) {
  return new Promise(resolve => {
    setTimeout(_ => {
      resolve();
    }, delayMs);
  });
}

function* reloadApp({ payload: shouldRender }) {
  if (!shouldRender) {
    yield pause(0);
    yield put(resetApiCallsAction());
    yield put(updateAppRenderedAction(true));
  }
}

function* softReloadApp() {
  yield put(updateAppRenderedAction(false));
}

const OPEN_SOCKET_REQUEST = createActionType(OPEN_SOCKET, REQUEST);
const OPEN_SOCKET_SUCCESS = createActionType(OPEN_SOCKET, SUCCESS);

export function* webSocketSaga() {
  yield takeEvery(OPEN_SOCKET_SUCCESS, sendPending);
  yield takeEvery(SEND_MESSAGE, addToPending);
  yield takeEvery(createActionType(LOGIN, SUCCESS), sendPending);
  yield takeLatest(UPDATE_APP_RENDERED, reloadApp);
  yield takeLatest(SOFT_RELOAD_APP, softReloadApp);

  while (yield take(OPEN_SOCKET_REQUEST)) {
    const { uri } = yield select(selectOptions);

    if (!uri) {
      yield put(forceCloseSocketAction());
      continue;
    }

    const socket = new window.WebSocket(uri);

    const socketChannel = yield call(createSocketChannel, socket);

    const { close, forceClose, heartbeatStopped } = yield race({
      task: all([call(handleEvent, socketChannel), call(sendMessage, socket)]),
      close: take(CLOSE_SOCKET),
      forceClose: take(FORCE_CLOSE_SOCKET),
      heartbeatStopped: call(watchHeartbeat, socketChannel),
    });

    if (close || forceClose || heartbeatStopped) {
      socketChannel.close();

      if (forceClose || heartbeatStopped) {
        yield put(closeSocketAction());
      }

      if (!forceClose) {
        yield call(reconnectDelay);

        yield fork(function*() {
          yield put(openSocketActions.request());
        });
      }
    }
  }
}
