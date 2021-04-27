export const SIZE_KEY = 'size';
export const VOLUME_KEY = 'volume';
export const TOTAL_KEY = 'total';
export const TOTAL_KEY_NOTIONAL = 'total';

export const LEVEL_SIDES = {
  ASK: 'ask',
  BID: 'bid',
  SPREAD: 'spread',
};

export const LEVEL_SIDE_VERB = {
  [LEVEL_SIDES.ASK]: 'sell',
  [LEVEL_SIDES.BID]: 'buy',
};

export const PRICE_LEVEL_TICK = 0.01;

export const LEVEL_INDICES = {
  PRICE: 0,
  SIZE: 1,
  PRICE_INT: 2,
};

export const UPDATE_TYPE_INDEX = 0;

export const AGGREGATION_LEVELS = [
  0.00000001,
  0.0000001,
  0.000001,
  0.00001,
  0.0001,
  0.001,
  0.01,
  0.05,
  0.1,
  0.25,
  0.5,
  1,
  5,
  10,
  25,
  50,
  100,
  250,
  500,
  1000,
  2500,
];

export const HEIGHT = {
  HEADER: 44,
  FOOTER: 32,
  PADDING: 40,
  TABLE_HEADER: 24,
  MIDDLE_ROW: 38,
  ROW: 22,
  TRADABLE_TOOLS: 86,
};
