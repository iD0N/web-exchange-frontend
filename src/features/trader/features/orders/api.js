import apiClient from '../../../../common/services/apiClient';
import { transformApiResponse } from '../../../../common/utils/apiHelpers';

import { normalizeOrders, decideSide } from './utils';

export const apiCallIds = {
  FETCH_OPEN_ORDERS: 'FETCH_OPEN_ORDERS',
  FETCH_ORDER_HISTORY: 'FETCH_ORDER_HISTORY',
  FETCH_FILLS: 'FETCH_FILLS',
  FETCH_ORDERS_WIDGET_CONFIG: 'FETCH_ORDERS_WIDGET_CONFIG',
};

export default {
  orderHistory: () =>
    apiClient
      .get('/orders?descending=true&status=done&status=canceled', {
        apiCallId: apiCallIds.FETCH_ORDER_HISTORY,
      })
      .then(res =>
        transformApiResponse(res, data => ({
          ...data,
          orders: normalizeOrders(data.orders),
        }))
      ),

  fills: () =>
    apiClient
      .get('/fills?descending=true', {
        apiCallId: apiCallIds.FETCH_FILLS,
      })
      .then(res =>
        transformApiResponse(res, data => ({
          ...data,
          fills: decideSide(data.fills),
        }))
      ),
};
