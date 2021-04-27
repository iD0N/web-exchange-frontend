import { isMobile } from 'react-device-detect';

export const CONNECTION_STATUS = {
  CONNECTING: 'CONNECTING',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
};

export const DEFAULT_OPTIONS = {
  uri: null,
  reconnectionTimeout: 5000,
};

export const BACKOFF_OPTIONS = {
  min: isMobile ? 3000 : 4000,
  max: isMobile ? 5000 : 30000,
  factor: 2,
  jitter: 0,
};

export const WS_CHANNELS = {
  ACCOUNT: 'account',
  COLLATERAL_PRICES: 'collateral-prices',
  TICKER: 'ticker',
  LEVEL2: 'level2',
  FUNDING: 'funding',
  ORDERS: 'orders',
  BALANCES: 'balances',
  POSITIONS: 'positions',
  TRADING: 'trading',
  NOTIFICATIONS: 'notifications',
  TRANSFERS: 'transfers',
};

export const WS_PRIVATE_CHANNELS = [
  WS_CHANNELS.ACCOUNT,
  WS_CHANNELS.ORDERS,
  WS_CHANNELS.BALANCES,
  WS_CHANNELS.POSITIONS,
  WS_CHANNELS.TRADING,
  WS_CHANNELS.NOTIFICATIONS,
  WS_CHANNELS.TRANSFERS,
];

export const WS_DATA_TYPES = {
  UPDATE: 'update',
  SNAPSHOT: 'snapshot',
};

export const WS_MESSAGE_TYPES = {
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  REQUEST: 'request',
};
