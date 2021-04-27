import { combineReducers } from 'redux';
import { takeLatest, call, put } from 'redux-saga/effects';

import {
  createReducer,
  createActionCreator,
  createApiActionCreators,
  createActionType,
  REQUEST,
  SUCCESS,
} from '../../../../common/utils/reduxHelpers';

import api from './api';

/**
 * ACTION TYPES
 */
export const FETCH_API_KEYS = 'api-keys/FETCH_API_KEYS';
export const CREATE_API_KEY = 'api-keys/CREATE_API_KEY';
export const DELETE_API_KEY = 'api-keys/DELETE_API_KEY';
export const CLEAR_CREATED = 'api-keys/CLEAR_CREATED';

/**
 * ACTIONS
 */
export const fetchApiKeysActions = createApiActionCreators(FETCH_API_KEYS);
export const createApiKeyActions = createApiActionCreators(CREATE_API_KEY);
export const deleteApiKeyActions = createApiActionCreators(DELETE_API_KEY);
export const clearCreatedAction = createActionCreator(CLEAR_CREATED);

/**
 * REDUCERS
 */
const initialState = {
  keys: [],
  created: {},
};

const keys = createReducer(initialState.keys, {
  [FETCH_API_KEYS]: {
    [SUCCESS]: (state, { apiKeys }) => apiKeys,
  },
  [CREATE_API_KEY]: {
    [SUCCESS]: (state, { secret, ...item }) => [...state, item],
  },
  [DELETE_API_KEY]: {
    [SUCCESS]: (state, deletedKey) => state.filter(({ key }) => deletedKey !== key),
  },
});

const created = createReducer(initialState.created, {
  [CREATE_API_KEY]: {
    [SUCCESS]: (state, item) => item,
  },
  [DELETE_API_KEY]: {
    [SUCCESS]: (state, key) => (key === state.key ? initialState.created : state),
  },
  [CLEAR_CREATED]: () => initialState.created,
});

export default combineReducers({
  keys,
  created,
});

/**
 * SELECTORS
 */
export const selectApiKeys = state => state.apiKeys;

export const selectKeys = state => selectApiKeys(state).keys;
export const selectCreated = state => selectApiKeys(state).created;

/**
 * SAGAS
 */
export function* fetchApiKeys() {
  const resp = yield call(api.getKeys);

  if (resp.ok) {
    yield put(fetchApiKeysActions.success(resp.data));
  }
}

export function* createApiKey({ payload }) {
  const resp = yield call(api.createKey, payload);
  if (resp.ok) {
    yield put(createApiKeyActions.success(resp.data));
  }
}

export function* deleteApiKey({ payload: key }) {
  const resp = yield call(api.deleteKey, key);

  if (resp.ok) {
    yield put(deleteApiKeyActions.success(key));
  }
}

export function* apiKeysSaga() {
  yield takeLatest(createActionType(FETCH_API_KEYS, REQUEST), fetchApiKeys);
  yield takeLatest(createActionType(CREATE_API_KEY, REQUEST), createApiKey);
  yield takeLatest(createActionType(DELETE_API_KEY, REQUEST), deleteApiKey);
}
