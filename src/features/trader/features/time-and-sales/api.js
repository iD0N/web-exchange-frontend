import apiClient from '../../../../common/services/apiClient';
import { transformApiResponse } from '../../../../common/utils/apiHelpers';

import { normalizeForLists } from './utils';
import { MIN_VOLUME } from './constants';

export const apiCallIds = {
  FETCH_AUCTIONS: 'FETCH_AUCTIONS',
};

export default {
  auctions: ({ contractCode, minTradeSize }) =>
    apiClient
      .get(
        `/contracts/${contractCode}/auctions?descending=true&min_volume=${minTradeSize ||
          MIN_VOLUME}`,
        {
          apiCallId: apiCallIds.FETCH_AUCTIONS,
        }
      )
      .then(res =>
        transformApiResponse(res, data => ({
          ...data,
          auctions: normalizeForLists(data.auctions),
        }))
      ),
};
