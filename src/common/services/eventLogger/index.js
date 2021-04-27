import { call, select, takeEvery } from 'redux-saga/effects';
import moment from 'moment';

import { createActionCreator } from '../../utils/reduxHelpers';
import { selectValues } from '../keyValueStore';
import { selectAccountTraderId } from '../accounts';

import { EVENT_ACTIONS } from './constants';
import api from './api';

/**
 * ACTION TYPES
 */
export const LOG_EVENT = 'eventLogger/LOG_EVENT';

/**
 * ACTIONS
 */
export const logEventAction = createActionCreator(LOG_EVENT);

const getWidgetPreferences = ({ action }, values = {}) => {
  if (action === EVENT_ACTIONS.CREATE_ORDER_INITIATE) {
    const preference = values.orderEntryWidgetConfig
      ? values.orderEntryWidgetConfig.isOrderConfimationRequired
      : undefined;
    return { preferences: { confirmationsEnabled: preference } };
  }
  if (EVENT_ACTIONS.CLOSE_POSITION_INITIATE === action) {
    const preference = values.orderEntryWidgetConfig
      ? values.orderEntryWidgetConfig.disableClosePositionConfirmation
      : undefined;
    return { preferences: { confirmationsEnabled: !preference } };
  }
  return {};
};

/**
 * SAGAS
 */
function* logEvent({ payload }) {
  try {
    const keyValueStoreValues = yield select(selectValues);
    const traderId = yield select(selectAccountTraderId);
    const event = {
      traderId,
      timestamp: moment().toISOString(),
      ...payload,
      ...getWidgetPreferences(payload, keyValueStoreValues),
    };

    if (event.orderInfo) {
      for (const k in event.orderInfo) {
        if (event.orderInfo[k] === undefined || event.orderInfo[k] === null) {
          delete event.orderInfo[k];
        }
      }
    }

    yield call(api.logEvent, event);
  } catch (err) {}
}

export function* eventLoggerSaga() {
  yield takeEvery(LOG_EVENT, logEvent);
}
