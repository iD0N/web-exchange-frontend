import apiClient from '../apiClient';
import { transformApiResponse } from '../../utils/apiHelpers';

export const apiCallIds = {
  FETCH_USER_COGNITO_PROFILE: 'FETCH_USER_COGNITO_PROFILE',
  FETCH_USER_AFFILIATE: 'FETCH_USER_AFFILIATE',
  ACCEPT_ACDX_TOKEN_TERMS: 'ACCEPT_ACDX_TOKEN_TERMS',
  GET_MAX_LEVERAGE: 'GET_MAX_LEVERAGE',
  SET_MAX_LEVERAGE: 'SET_MAX_LEVERAGE',
};

export default {
  getAffiliate: () =>
    apiClient
      .get('/user', {
        apiCallId: apiCallIds.FETCH_USER_AFFILIATE,
      })
      .then(res =>
        transformApiResponse(
          res,
          ({
            affiliateInfo: { referralCode, referralCount },
            eligibleForDepositMatch,
            acdxTokenTermsAcceptedAt,
            isSaftHolder,
          }) => ({
            eligibleForDepositMatch,
            referralCode,
            referralCount,
            acdxTokenTermsAcceptedAt,
            isSaftHolder,
          })
        )
      ),

  getTerms: () =>
    apiClient.get('/terms', {
      apiCallId: null,
      public: true,
    }),

  acceptTerms: (terms, sub, referralCode, user = {}) => {
    apiClient.post(
      '/user/completeSignup',
      {
        terms,
        sub,
        referralCode,
        user,
        termsVerdict: {
          acceptTOS: true,
          acceptPrivacyPolicy: true,
        },
      },
      {
        apiCallId: null,
        public: true,
      }
    )
  },

  acceptACDXTokenTerms: () =>
    apiClient.post(
      '/user/acceptACDXTerms',
      {},
      {
        apiCallId: apiCallIds.ACCEPT_ACDX_TOKEN_TERMS,
        public: false,
      }
    ),

   getMaxLeverage: traderId =>
     apiClient.get(`/accounts/${traderId}/max-leverage`, {
       apiCallId: apiCallIds.GET_MAX_LEVERAGE
     }),

   setMaxLeverage: (traderId, data) =>
     apiClient.put(`/accounts/${traderId}/max-leverage`, data, {
       apiCallId: apiCallIds.SET_MAX_LEVERAGE
     }),
};
