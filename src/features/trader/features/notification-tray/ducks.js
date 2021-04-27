import { combineReducers } from 'redux';
import { put, select, takeEvery } from 'redux-saga/effects';
import { createSelector } from 'reselect';

import { store } from '../../../../app/store/configureStore';
import { selectValues } from '../../../../common/services/keyValueStore';
import NotificationService from '../../../../common/services/notification';
import { RECEIVE_MESSAGE } from '../../../../common/services/webSocket';
import { createReducer, createActionCreator } from '../../../../common/utils/reduxHelpers';
import { WS_CHANNELS, WS_DATA_TYPES } from '../../constants';
import { selectContracts } from '../../data-store/ducks';
import { SOFT_RELOAD_APP } from '../../../../common/services/webSocket';

import { localizeNotification } from './utils';

const MAX_VISIBLE = 100;

const NOTIFICATION_TYPE = {
  ORDER: 'order',
  TRANSFER: 'transfer',
  TRADER_STATE: 'trader-state',
  VOLUME_TIER: 'volume-tier',
};

const normalizeNotification = (notif, contracts) => {
  if (
    notif.notificationType === NOTIFICATION_TYPE.TRADER_STATE &&
    notif.details.state === 'liquidating'
  ) {
    notif.liquidatingStateCreated = notif.details.action === 'create';
    notif.liquidatingStateDeleted = notif.details.action === 'delete';
  }

  return localizeNotification(notif, contracts);
};

/**
 * ACTION TYPES
 */
export const INITIALIZE_NOTIFICATIONS = 'notifications/INITIALIZE_NOTIFICATIONS';
export const INSERT_NOTIFICATION = 'notifications/INSERT_NOTIFICATION';
export const MARK_NOTIFICATIONS_READ = 'notifications/MARK_NOTIFICATIONS_READ';
export const UPDATE_VISIBLE = 'notifications/UPDATE_VISIBLE';
export const STORE_FOR_BATCH_MARK_READ = 'notifications/STORE_FOR_BATCH_MARK_READ';
export const BATCH_MARK_READ = 'notifications/BATCH_MARK_READ';
export const BATCH_MARK_READ_COMPLETE = 'notifications/BATCH_MARK_READ_COMPLETE';

/**
 * ACTIONS
 */
export const initializeNotificationsAction = createActionCreator(INITIALIZE_NOTIFICATIONS);
export const insertNotificationAction = createActionCreator(INSERT_NOTIFICATION);
export const markNotificationsReadAction = createActionCreator(MARK_NOTIFICATIONS_READ);
export const updateVisibleAction = createActionCreator(UPDATE_VISIBLE);
export const storeForBatchMarkReadAction = createActionCreator(STORE_FOR_BATCH_MARK_READ);
export const batchMarkReadAction = createActionCreator(BATCH_MARK_READ);
export const batchMarkReadCompleteAction = createActionCreator(BATCH_MARK_READ_COMPLETE);

/**
 * REDUCERS
 */
const initialState = {
  notifications: [],
  toMarkAsRead: [],
  visible: false,
};

const notifications = createReducer(initialState.notifications, {
  [INITIALIZE_NOTIFICATIONS]: (_, notifications) => notifications,
  [INSERT_NOTIFICATION]: (state, notification) => [notification, ...state],
  [MARK_NOTIFICATIONS_READ]: state => state.map(notification => ({ ...notification, read: true })),
});

const visible = createReducer(initialState.visible, {
  [UPDATE_VISIBLE]: (state, visible) => visible,
});

const toMarkAsRead = createReducer(initialState.toMarkAsRead, {
  [STORE_FOR_BATCH_MARK_READ]: (state, notifIds) => [...state, ...notifIds],
  [BATCH_MARK_READ_COMPLETE]: _ => [],
});

export default combineReducers({
  notifications,
  toMarkAsRead,
  visible,
});

/**
 * SELECTORS
 */
export const selectNotificationTray = state => state.notificationTray;

export const selectVisible = state => selectNotificationTray(state).visible;
export const selectNotifications = state => selectNotificationTray(state).notifications;
export const selectToMarkAsRead = state => selectNotificationTray(state).toMarkAsRead;

export const selectUnreadNotifications = createSelector(selectNotifications, notifications =>
  notifications.filter(notification => !notification.read)
);

export const selectUnreadCount = createSelector(
  selectUnreadNotifications,
  unreadNotifications => unreadNotifications.length
);

export const selectFilteredNotifications = createSelector(
  selectNotifications,
  selectUnreadCount,
  (notifications, unread) =>
    unread >= MAX_VISIBLE
      ? notifications.filter(({ read }) => !read)
      : notifications.slice(0, MAX_VISIBLE)
);

export const selectCanSendOrderNotifications = createSelector(
  selectValues,
  ({ orderEntryWidgetConfig }) => {
    return !orderEntryWidgetConfig
      ? true
      : !orderEntryWidgetConfig['disableOrderStatusUpdateNotifications'];
  }
);

/**
 * SAGAS
 */
function* receiveMessage({ payload: { channel, type, data } }) {
  if (channel === WS_CHANNELS.NOTIFICATIONS) {
    const contracts = yield select(selectContracts);
    const orderNotificationsEnabled = yield select(selectCanSendOrderNotifications);
    if (type === WS_DATA_TYPES.SNAPSHOT) {
      const normalized = data
        .filter(
          notif => orderNotificationsEnabled || notif.notificationType !== NOTIFICATION_TYPE.ORDER
        )
        .map(notif => normalizeNotification(notif, contracts))
        .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
      const liqIndex = normalized.findIndex(
        ({ liquidatingStateCreated }) => !!liquidatingStateCreated
      );
      const liqDelIndex = normalized.findIndex(
        ({ liquidatingStateDeleted }) => !!liquidatingStateDeleted
      );
      if (liqIndex >= 0 && (liqIndex < liqDelIndex || (liqIndex !== -1 && liqDelIndex === -1))) {
        normalized[liqIndex].sticky = true;
      }

      yield put(initializeNotificationsAction(normalized));
    } else {
      const canNotify =
        data.notificationType !== NOTIFICATION_TYPE.ORDER ? true : orderNotificationsEnabled;

      if (!canNotify) return;

      const trayVisible = yield select(selectVisible);
      const notif = normalizeNotification(data, contracts);
      const { type, subject, body, notificationId } = notif;

      if (notif.liquidatingStateCreated) {
        notif.sticky = true;
        yield put(insertNotificationAction(notif));
      } else if (notif.liquidatingStateDeleted) {
        // make sure sticky property not present on any
        const notifications = yield select(selectNotifications);
        yield put(
          initializeNotificationsAction(
            [notif, ...notifications].map(a => ({ ...a, sticky: false }))
          )
        );
      } else {
        yield put(insertNotificationAction(notif));
      }

      if (!trayVisible) {
        yield NotificationService[type]({
          body,
          subject,
          onClick: closeNotificationAndOpenTray,
          onClose: markAsReadMethod(notificationId),
        });
      }
    }
  }
}

function* storeForBatchMarkRead({ payload: notificationIds }) {
  yield put(storeForBatchMarkReadAction(notificationIds));
}

function* batchMarkRead() {
  const notificationIds = yield select(selectToMarkAsRead);
  if (!notificationIds.length) {
    return;
  }

  // We previously called the backend here to mark the notification read, but
  // this is not useful backend state to keep - so I'm turning it off for perf reasons.
  // yield call(api.markAsRead, notificationIds);
  yield put(batchMarkReadCompleteAction());
}

function* resetNotifications() {
  yield batchMarkRead();
  yield put(batchMarkReadCompleteAction());
}

export function* notificationsSaga() {
  yield takeEvery(RECEIVE_MESSAGE, receiveMessage);
  yield takeEvery(MARK_NOTIFICATIONS_READ, storeForBatchMarkRead);
  yield takeEvery(BATCH_MARK_READ, batchMarkRead);
  yield takeEvery(SOFT_RELOAD_APP, resetNotifications);
}

/*
 * HELPERS
 */
export const closeNotificationAndOpenTray = () => {
  NotificationService.destroy();
  store.dispatch(updateVisibleAction(true));
};

const markAsReadMethod = notificationId => () =>
  store.dispatch(markNotificationsReadAction([notificationId]));
