import { combineReducers } from 'redux';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { takeEvery, call, put, select, all, delay } from 'redux-saga/effects';

import { LOGIN, selectIsLoggedIn } from '../user';
import { logEventAction } from '../eventLogger';
import { SOFT_RELOAD_APP } from '../webSocket';
import { getAuthTokens } from '../webSocket/utils';
import { EVENT_ACTIONS, EVENT_TYPES } from '../eventLogger/constants';
import {
  createReducer,
  createActionCreator,
  createApiActionCreators,
  createActionType,
  REQUEST,
  SUCCESS,
} from '../../utils/reduxHelpers';

import api from './api';

const PERSIST_DELAY_MS = 1000;
const pendingGetArgs = [];
const storedFromAuth = {};

/**
 * ACTION TYPES
 */
export const GET_VALUE = 'keyValueStore/GET_VALUE';
export const SET_VALUE = 'keyValueStore/SET_VALUE';
export const CLEAR_PENDING_VALUES = 'keyValueStore/CLEAR_PENDING_VALUES';
export const RESET_VALUES = 'keyValueStore/RESET_VALUES';

/**
 * ACTIONS
 */
export const getValueActions = createApiActionCreators(GET_VALUE);
export const setValueAction = createActionCreator(SET_VALUE);
export const clearPendingValuesAction = createActionCreator(CLEAR_PENDING_VALUES);
export const resetValuesAction = createActionCreator(RESET_VALUES);

/**
 * REDUCERS
 */
const initialState = {
  values: {},
  pendingValues: {},
};

const values = createReducer(initialState.values, {
  [GET_VALUE]: {
    [SUCCESS]: (state, { key, value }) => ({
      ...state,
      [key]: value,
    }),
  },
  [SET_VALUE]: (state, { key, value }) => ({
    ...state,
    [key]: value,
  }),
  [RESET_VALUES]: _ => ({}),
});

const pendingValues = createReducer(initialState.pendingValues, {
  [SET_VALUE]: (state, { key, value, options }) => ({
    ...state,
    [key]: { value, options },
  }),
  [CLEAR_PENDING_VALUES]: () => initialState.pendingValues,
  [RESET_VALUES]: _ => ({}),
});

export default combineReducers({
  values,
  pendingValues,
});

/**
 * SELECTORS
 */
export const selectKeyValueStore = state => state.keyValueStore;

export const selectValues = state => selectKeyValueStore(state).values;
export const selectPendingValues = state => selectKeyValueStore(state).pendingValues;

export const selectPendingValuesIfExists = createSelector(selectPendingValues, pendingValues =>
  Object.keys(pendingValues).length > 0 ? pendingValues : false
);

export const selectValueByKey = (state, key) => selectValues(state)[key];

export const createValueSelector = (key, defaultValue) => state =>
  selectValueByKey(state, key) || defaultValue;

/**
 * SAGAS
 */
export function* getValue({ payload: { key, options, fallbackValue } }) {
  const isLoggedIn = yield select(selectIsLoggedIn);
  const { accessToken } = yield getAuthTokens();

  if (!isLoggedIn || !accessToken) {
    pendingGetArgs.push({ key, options, fallbackValue });
    yield put(getValueActions.success({ key, value: fallbackValue }));
    return;
  }

  const resp = yield call(api.getValue, key, options);
  storedFromAuth[key] = true;

  if (resp.ok) {
    yield put(getValueActions.success({ key, value: resp.data }));
    yield put(
      logEventAction({
        action: EVENT_ACTIONS.RECEIVE_WIDGET_CONFIG,
        data: {
          widgetData: resp.data,
          widgetKey: key,
        },
        statusCode: resp.status,
        type: EVENT_TYPES.REST,
      })
    );
  } else if (fallbackValue !== undefined) {
    yield put(getValueActions.success({ key, value: fallbackValue }));
    yield call(api.setValue, key, fallbackValue);
    yield put(
      logEventAction({
        action: EVENT_ACTIONS.RECEIVE_WIDGET_CONFIG,
        data: {
          widgetKey: key,
        },
        statusCode: resp.status,
        type: EVENT_TYPES.REST,
      })
    );
  }
}

export function* getPendingValues() {
  const args = pendingGetArgs.slice();
  while (pendingGetArgs.length) {
    pendingGetArgs.pop();
  }
  yield all(args.map(payload => getValue({ payload })));
}

export function* setValue({ payload: { key, value } }) {
  if (!storedFromAuth[key]) {
    return;
  }
  yield put(
    logEventAction({
      action: EVENT_ACTIONS.SAVE_WIDGET_CONFIG,
      data: {
        widgetKey: key,
        widgetData: value,
      },
      type: EVENT_TYPES.REST,
    })
  );
}

export function* resetValues() {
  yield put(resetValuesAction());
}

export function* keyValueStoreSaga() {
  yield takeEvery(createActionType(GET_VALUE, REQUEST), getValue);
  yield takeEvery(SET_VALUE, setValue);
  yield takeEvery(createActionType(LOGIN, SUCCESS), getPendingValues);
  yield takeEvery(SOFT_RELOAD_APP, resetValues);

  while (true) {
    const pendingValues = yield select(selectPendingValuesIfExists);

    if (pendingValues) {
      yield put(clearPendingValuesAction());
      const isLoggedIn = yield select(selectIsLoggedIn);

      if (isLoggedIn) {
        yield all(
          Object.entries(pendingValues).map(([key, { value, options }]) =>
            call(api.setValue, key, value, options)
          )
        );
      }
    }

    yield delay(PERSIST_DELAY_MS);
  }
}

/**
 * DECORATORS
 */
export const ignoreErrorOptions = {
  ignoreError: error => !error.response || error.response.status === 404,
};

export const connectKeyValueStore = (key, defaultValue) => Component =>
  connect(
    state => ({
      [key]: selectValueByKey(state, key) || defaultValue,
    }),
    {
      getValue: (options, fallbackValue) =>
        getValueActions.request({
          key,
          options: {
            ...options,
            ...ignoreErrorOptions,
          },
          fallbackValue,
        }),
      setValue: (value, options) => setValueAction({ key, value, options }),
    }
  )(Component);
