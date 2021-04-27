export const EVENT_ACTIONS = {
  CANCEL_ALL_ORDERS: 'cancel-orders-all',
  CANCEL_ALL_ORDERS_BUY: 'cancel-all-orders-buy',
  CANCEL_ALL_ORDERS_SELL: 'cancel-all-orders-sell',
  CANCEL_ORDER: 'cancel-order',
  CANCEL_ORDERS: 'cancel-orders',
  CLOSE_POSITION_INITIATE: 'close-position-initiate',
  CLOSE_POSITION_CONFIRM: 'close-position-confirm',
  CREATE_ORDER_INITIATE: 'create-order',
  CREATE_ORDER_CONFIRM: 'create-order-confirm',
  CREATE_ORDER_CONFIRM_CANCEL: 'create-order-confirm-cancel',
  MODIFY_ORDERS: 'modify-orders-trade-mode',
  MODIFY_ORDER_CONFIRM: 'modify-order-confirm',
  MODIFY_ORDER_INITIATE: 'modify-order-initiate',
  RECEIVE_WIDGET_CONFIG: 'receive-widget-config',
  SAVE_WIDGET_CONFIG: 'save-widget-config',
  SEND_MESSAGE: 'send-message',
};

export const EVENT_TYPES = {
  CLICK: 'click-event',
  DRAG_TFC: 'drag-tfc',
  DRAG_DOM: 'drag-dom',
  REST: 'rest-call',
  SOCKET_MESSAGE: 'socket-message',
};
