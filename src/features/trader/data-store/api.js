import BigNumber from 'bignumber.js';
import moment from 'moment';

import { CONTRACT_TYPE } from '../../../common/enums';
import apiClient from '../../../common/services/apiClient';
import { transformApiResponse } from '../../../common/utils/apiHelpers';
import { ORDER_SIZE_DECIMALS, PRICE_DECIMALS } from '../constants';

const apiCallIds = {
  GET_CONTRACTS_AUTHED: 'GET_CONTRACTS_AUTHED',
  GET_TOKENS: 'GET_TOKENS',
};

export default {
  fetchContracts: withAuth =>
    apiClient
      .get('/contracts/active', {
        public: !withAuth,
        apiCallId: withAuth ? apiCallIds.GET_CONTRACTS_AUTHED : undefined,
      })
      .then(res =>
        transformApiResponse(res, data => ({
          ...data,
          contracts: data.contracts.map(contract => {
            const priceDecimals = BigNumber(contract.minimumPriceIncrement).dp();
            let quoteLongName;
            if (contract.type === CONTRACT_TYPE.SPOT) {
              const quoteContract = data.contracts.find(
                ({ seriesCode }) => seriesCode === contract.quoteCurrency
              );
              if (quoteContract) {
                quoteLongName = quoteContract.longName;
              }
            }

            return {
              ...contract,
              isExpired: contract.expiryTime != null && moment().isAfter(contract.expiryTime),
              minimumQuantity: '0.0001', // TODO remove mocked data
              priceDecimals: priceDecimals > PRICE_DECIMALS ? priceDecimals : PRICE_DECIMALS,
              quantityStep: '1.0000', // TODO remove mocked data
              sizeDecimals: ORDER_SIZE_DECIMALS, // TODO remove mocked data
              outage: {},
              quoteLongName,
            };
          }),
        }))
      ),
  fetchTokens: () =>
    apiClient
      .get('/tokens', { public: true, apiCallId: apiCallIds.GET_TOKENS })
      .then(res => transformApiResponse(res, data => data)),
};
