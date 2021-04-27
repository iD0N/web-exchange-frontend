import { fork, delay, flush, actionChannel } from 'redux-saga/effects';
import { createSelector } from 'reselect';
import { registerSelectors } from 'reselect-tools';
import flattenDeep from 'lodash.flattendeep';
import reduce from 'lodash.reduce';

import config from '../../config';

export const REQUEST = 'REQUEST';
export const SUCCESS = 'SUCCESS';
export const FAILURE = 'FAILURE';

export const createActionType = (...parts) => flattenDeep(parts).join('_');

export const createActionCreator = (...type) => payload => ({
  type: createActionType(type),
  payload,
});

export const createApiActionCreators = (...type) => ({
  request: createActionCreator(type, REQUEST),
  success: createActionCreator(type, SUCCESS),
  failure: createActionCreator(type, FAILURE),
});

export const createReducer = (initialState, reducerMap) => {
  const iterator = (reducers, initial = {}, prefix = []) =>
    reduce(
      reducers,
      (acc, reducer, type) => {
        if (typeof reducer === 'function') {
          return { ...acc, [createActionType(prefix, type)]: reducer };
        }
        return iterator(reducer, acc, [createActionType(prefix, type)]);
      },
      initial
    );

  const flattened = iterator(reducerMap);

  return (state = initialState, action) => {
    const reducer = flattened[action.type];
    return reducer ? reducer(state, action.payload) : state;
  };
};

export const findInArray = (array, selector) => array.find(selector);

export const replaceInArray = (array, selector, value) => {
  const idx = array.findIndex(selector);

  return idx >= 0 ? [...array.slice(0, idx), value, ...array.slice(idx + 1)] : array;
};

export const replaceOrInsertIntoArray = (array, selector, value) => {
  const idx = array.findIndex(selector);

  return idx >= 0 ? [...array.slice(0, idx), value, ...array.slice(idx + 1)] : [...array, value];
};

export const updateInArray = (array, selector, diff) => {
  const idx = array.findIndex(selector);

  return idx >= 0
    ? [...array.slice(0, idx), { ...array[idx], ...diff }, ...array.slice(idx + 1)]
    : array;
};

export const removeFromArray = (array, selector) => {
  const idx = array.findIndex(selector);

  return idx >= 0 ? [...array.slice(0, idx), ...array.slice(idx + 1)] : array;
};

const enableSelectorPerfMarking =
  performance && performance.measure && performance.mark && config().enableDebug;

const createFuncWithMark = (name, callback) => (...args) => {
  const startMark = `${name}_start`;
  const endMark = `${name}_end`;
  performance.mark(startMark);
  const result = callback(...args);
  performance.mark(endMark);
  performance.measure(`♻️ ${name}-Selector`, startMark, endMark);
  performance.clearMarks(startMark);
  performance.clearMarks(endMark);
  performance.clearMeasures(startMark);
  performance.clearMeasures(endMark);
  return result;
};

export const createMarkedSelector = (name, ...args) => {
  if (!enableSelectorPerfMarking) {
    return createSelector(...args);
  }
  if (!name || typeof name !== 'string') {
    throw new Error('marked selectors must have names');
  }
  const callback = args.pop();
  const funcWithMark = createFuncWithMark(name, callback);
  args.push(funcWithMark);
  const selector = createSelector(...args);
  registerSelectors({ [name]: selector });
  return selector;
};

// throttles the invocation of `task` with the latest `pattern` actions to once
// per `ms` milliseconds. redux-saga's built-in `throttle()` only buffers a single
// latest action.
export const fullThrottle = (ms, pattern, task) =>
  fork(function*() {
    const throttleChannel = yield actionChannel(pattern);

    while (true) {
      const action = yield flush(throttleChannel);
      yield fork(task, action);
      yield delay(ms);
    }
  });
