import apiClient from '../../../../common/services/apiClient';

export const apiCallIds = {
  CANCEL_WITHDRAWAL: 'CANCEL_WITHDRAWAL',
  GET_DEPOSIT_ADDRESS: 'GET_DEPOSIT_ADDRESS',
  GET_TRANSFERS: 'GET_TRANSFERS',
  REQUEST_WITHDRAWAL: 'REQUEST_WITHDRAWAL',
  GET_STAKING_INFO: 'GET_STAKING_INFO',
  POST_STAKING: 'POST_STAKING',
  DELETE_STAKING: 'DELETE_STAKING',
};

export default {
  cancelWithdrawal: transferId =>
    apiClient.delete(`/transfers/withdrawal-request/${transferId}`, {
      apiCallId: apiCallIds.CANCEL_WITHDRAWAL,
    }),

  getDepositAddress: token =>
    apiClient.get(`/transfers/deposit-address/${token}`, {
      apiCallId: apiCallIds.GET_DEPOSIT_ADDRESS,
    }),

  getTransfers: () =>
    apiClient.get(`/transfers`, {
      apiCallId: apiCallIds.GET_TRANSFERS,
    }),

  requestWithdrawal: payload =>
    apiClient.post(`/transfers/withdrawal-request`, payload, {
      apiCallId: apiCallIds.REQUEST_WITHDRAWAL,
    }),

  getStakingInfo: () =>
    apiClient.get(`/transfers/token-stake`, {
      apiCallId: apiCallIds.GET_STAKING_INFO,
    }),

  postStaking: payload =>
    apiClient.post(`/transfers/token-stake`, payload, {
      apiCallId: apiCallIds.POST_STAKING,
    }),

  deleteStaking: payload =>
    apiClient.delete(`/transfers/token-stake`, {
      apiCallId: apiCallIds.DELETE_STAKING,
      data: payload,
    }),
};
