export const CONFIRM_ORDER_MODAL_ID = 'order-entry/ORDER-CONFIRMATION';

export const ORDER_ENTRY_WIDGET_CONFIG_VALUE_KEY = 'orderEntryWidgetConfig';

export const CONFIG_KEYS = {
  IS_ORDER_CONFIRMATION_REQUIRED: 'isOrderConfimationRequired',
  DISABLE_ORDER_STATUS_UPDATE_NOTIFICATIONS: 'disableOrderStatusUpdateNotifications',
  DISABLE_CLOSE_POSITION_CONFIRMATION: 'disableClosePositionConfirmation',
  DEFAULT_SIZE_TYPE: 'defaultSizeType',
};

export const SIZE_TYPE = {
  NOTIONAL: 'notional',
  QUANTITY: 'quantity',
};

export const widgetConfigInitialValue = {
  [CONFIG_KEYS.IS_ORDER_CONFIRMATION_REQUIRED]: true,
  [CONFIG_KEYS.DISABLE_ORDER_STATUS_UPDATE_NOTIFICATIONS]: false,
  [CONFIG_KEYS.DEFAULT_SIZE_TYPE]: SIZE_TYPE.QUANTITY,
  [CONFIG_KEYS.DISABLE_CLOSE_POSITION_CONFIRMATION]: false,
};

export const AUTO_LIQUIDATION = 'auto-liquidation';
export const AUTO_REJECT = 'auto-reject';
export const CLOSE_OUT = 'close-out';
