import { createSelector } from 'reselect';
import { takeLatest, put } from 'redux-saga/effects';

import { createActionCreator } from '../../../common/utils/reduxHelpers';
import {
  getValueActions,
  setValueAction,
  createValueSelector,
  ignoreErrorOptions,
} from '../../../common/services/keyValueStore';

import { LAYOUT_VERSION, layouts } from './widgetConfigs';

const LAYOUT_MANAGER_VALUE_KEY = 'gridLayout';

/**
 * ACTION TYPES
 */
export const FETCH_LAYOUT = 'layoutManager/FETCH_LAYOUT';
export const SET_LAYOUT = 'layoutManager/SET_LAYOUT';
export const CHANGE_LAYOUT = 'layoutManager/CHANGE_LAYOUT';
export const RESET_LAYOUT = 'layoutManager/RESET_LAYOUT';

/**
 * ACTIONS
 */
export const fetchLayoutAction = createActionCreator(FETCH_LAYOUT);
export const setLayoutAction = createActionCreator(SET_LAYOUT);
export const changeLayoutAction = createActionCreator(CHANGE_LAYOUT);
export const resetLayoutAction = createActionCreator(RESET_LAYOUT);

/**
 * SELECTORS
 */
const initialState = {
  layout: [],
  layoutVersion: LAYOUT_VERSION,
};

const fallbackValue = {
  layout: layouts.STANDARD.config,
  layoutVersion: LAYOUT_VERSION,
};

export const selectLayoutManager = createValueSelector(LAYOUT_MANAGER_VALUE_KEY, initialState);

export const selectLayout = createSelector(selectLayoutManager, ({ layout, layoutVersion }) =>
  layoutVersion < LAYOUT_VERSION ? layouts.STANDARD.config : layout
);

/**
 * SAGAS
 */
export function* fetchLayout() {
  yield put(
    getValueActions.request({
      key: LAYOUT_MANAGER_VALUE_KEY,
      options: ignoreErrorOptions,
      fallbackValue,
    })
  );
}

export function* changeLayout({ payload: layout }) {
  yield saveLayout(layout);
}

export function* resetLayout({ payload: { config: layoutConfig } = layouts.STANDARD }) {
  yield saveLayout(layoutConfig);
}

function* saveLayout(layout) {
  yield put(
    setValueAction({
      key: LAYOUT_MANAGER_VALUE_KEY,
      value: { layout, layoutVersion: LAYOUT_VERSION },
    })
  );
}

export function* layoutManagerSaga() {
  yield takeLatest(FETCH_LAYOUT, fetchLayout);
  yield takeLatest(CHANGE_LAYOUT, changeLayout);
  yield takeLatest(RESET_LAYOUT, resetLayout);
}
