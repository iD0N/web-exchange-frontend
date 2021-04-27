import { combineReducers } from 'redux';
import { connect } from 'react-redux';
import { put } from 'redux-saga/effects';

import { createActionCreator, createReducer } from '../utils/reduxHelpers';

/**
 * ACTION TYPES
 */
const START_API_CALL = 'spinner/START_API_CALL';
const FINISH_API_CALL = 'spinner/FINISH_API_CALL';
const SET_CONNECTED_STATUS = 'spinner/SET_CONNECTED_STATUS';
const RESET_API_CALLS = 'spinner/RESET_API_CALLS';

/**
 * ACTIONS
 */
export const startApiCall = createActionCreator(START_API_CALL);
export const finishApiCall = createActionCreator(FINISH_API_CALL);
export const setConnectedStatus = createActionCreator(SET_CONNECTED_STATUS);
export const resetApiCallsAction = createActionCreator(RESET_API_CALLS);

/**
 * REDUCERS
 */
const initialState = {
  globalCounter: 0,
  apiCalls: {},
  connected: true,
};

const globalCounter = createReducer(initialState.globalCounter, {
  [START_API_CALL]: (state, payload) =>
    payload.apiCallId || payload.apiCallId === null ? state : state + 1,
  [FINISH_API_CALL]: (state, payload) =>
    payload.apiCallId || payload.apiCallId === null ? state : state - 1,
  [RESET_API_CALLS]: _ => 0,
});

const apiCalls = createReducer(initialState.apiCalls, {
  [START_API_CALL]: (state, payload) =>
    payload.apiCallId
      ? {
          ...state,
          [payload.apiCallId]: state[payload.apiCallId] ? state[payload.apiCallId] + 1 : 1,
        }
      : state,
  [FINISH_API_CALL]: (state, payload) =>
    payload.apiCallId
      ? {
          ...state,
          [payload.apiCallId]: state[payload.apiCallId]
            ? Math.max(state[payload.apiCallId] - 1, 0)
            : 0,
        }
      : state,
  [RESET_API_CALLS]: _ => ({}),
});

const connected = createReducer(initialState.connected, {
  [SET_CONNECTED_STATUS]: (state, status) => (status !== state ? status : state),
});

export default combineReducers({
  globalCounter,
  apiCalls,
  connected,
});

/**
 * SELECTORS
 */
const selectSpinner = state => state.spinner;
export const selectIsInProgress = (state, apiCallId) => !!selectSpinner(state).apiCalls[apiCallId];
const selectGlobalCounter = state => !!selectSpinner(state).globalCounter;
export const selectIsConnected = state => selectSpinner(state).connected;

/**
 * DECORATORS
 */
export function withApiCall(apiCallId, saga) {
  return function*(...args) {
    yield put(startApiCall({ apiCallId }));
    yield* saga.apply(saga, args);
    yield put(finishApiCall({ apiCallId }));
  };
}

export const connectSpinner = apiCallIds => Component => {
  const createMapStateToProps = apiCallIds => {
    const entries = Object.entries(apiCallIds);

    return state =>
      entries.reduce(
        (acc, [propName, apiCallId]) => ({
          ...acc,
          [propName]: selectIsInProgress(state, apiCallId),
        }),
        {}
      );
  };

  return connect(
    apiCallIds
      ? createMapStateToProps(apiCallIds)
      : state => ({
          isLoading: selectGlobalCounter(state),
        })
  )(Component);
};
