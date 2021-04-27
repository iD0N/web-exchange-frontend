import { ORDER_TYPE } from '../../common/enums'; // TODO move ORDER_TYPE here

export { WS_CHANNELS } from '../../common/services/webSocket/constants';
export { WS_PRIVATE_CHANNELS } from '../../common/services/webSocket/constants';
export { WS_DATA_TYPES } from '../../common/services/webSocket/constants';
export { WS_MESSAGE_TYPES } from '../../common/services/webSocket/constants';

export const PRICE_DECIMALS = 2;

export const ORDER_SIZE_DECIMALS = 4;

export const ORDER_TYPE_ABBREVIATIONS = {
  [ORDER_TYPE.LIMIT]: 'LMT',
  [ORDER_TYPE.MARKET]: 'MKT',
  [ORDER_TYPE.STOP_MARKET]: 'STP',
  [ORDER_TYPE.TAKE_MARKET]: 'TKP',
};

export const ORDER_TYPE_ABBREVIATIONS_TFC = {
  [ORDER_TYPE.LIMIT]: 'LMT',
  [ORDER_TYPE.MARKET]: 'MKT',
  [ORDER_TYPE.STOP_LIMIT]: 'STP-LMT',
  [ORDER_TYPE.TAKE_LIMIT]: 'TKP-LMT',
  [ORDER_TYPE.STOP_MARKET]: 'STP-MKT',
  [ORDER_TYPE.TAKE_MARKET]: 'TKP-MKT',
};

export const ZERO_SIZE_STRING = '0.0000';
