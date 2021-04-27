export const MODIFY_ORDER_MODAL_ID = 'modify-order/MODAL';

export const ORDER_STATUS = {
  ACCEPTED: 'accepted',
  CANCELED: 'canceled',
  CANCELLING: 'cancelling',
  DONE: 'done',
  FILLED: 'filled',
  MODIFYING: 'modifying',
  PENDING: 'pending',
  PARTIAL: 'partial',
  RECEIVED: 'received',
  REJECTED: 'rejected',
};

export const ORDER_ACTION = {
  ACCEPTED: 'accepted',
  CANCEL_REJECTED: 'cancel-rejected',
  CANCELED: 'canceled',
  FILLED: 'filled',
  MODIFY_REJECTED: 'modify-rejected',
  RECEIVED: 'order-received',
  REJECTED: 'rejected',
  TRIGGERED: 'triggered',
};

export const ORDER_ACTIONS_MAP = Object.values(ORDER_ACTION).reduce(
  (map, value) => ({ ...map, [value]: true }),
  {}
);

export const TABLE_TARGET = {
  HISTORY: 'history',
  OPEN: 'open',
};

export const TABS = {
  ORDERS: 'ORDERS',
  ORDER_HISTORY: 'ORDER_HISTORY',
  FILLS: 'FILLS',
};
