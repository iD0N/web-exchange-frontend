import apiClient from '../../../common/services/apiClient';

export const apiCallIds = {
  INITIATE_KYC: 'INITIATE_KYC',
  KYC_PENDING: 'KYC_PENDING',
};

export default {
  initiateKyc: payload =>
    apiClient.post('/user/initiate-kyc', payload, {
      apiCallId: apiCallIds.INITIATE_KYC,
    }),

  kycPending: payload =>
    apiClient.post('/user/kyc-pending', payload, {
        apiCallId: apiCallIds.KYC_PENDING,
      }
    ),
};
