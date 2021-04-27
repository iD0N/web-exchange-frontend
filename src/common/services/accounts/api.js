import apiClient from '../apiClient';

export const apiCallIds = {
  FETCH_ACCOUNTS: 'FETCH_ACCOUNTS',
  UPDATE_ACCOUNT_ALIAS: 'UPDATE_ACCOUNT_ALIAS',
  CREATE_ACCOUNT: 'CREATE_ACCOUNT',
  DELETE_ACCOUNT: 'DELETE_ACCOUNT',
  INTERNAL_TRANSFER: 'INTERNAL_TRANSFER',
  REBALANCE_USD: 'REBALANCE_USD',
};

export default {
  getAccounts: () => apiClient.get('/accounts', { apiCallId: apiCallIds.FETCH_ACCOUNTS }),

  getAccountData: traderId => apiClient.get(`/accounts/${traderId}`, { apiCallId: null }),

  updateAccountAlias: (traderId, alias) =>
    apiClient.put(
      `/accounts/${traderId}/alias`,
      { alias },
      {
        apiCallId: apiCallIds.UPDATE_ACCOUNT_ALIAS,
      }
    ),

  createAccount: (options = {}) =>
    apiClient.post('/accounts', options, {
      apiCallId: apiCallIds.CREATE_ACCOUNT,
    }),

  deleteAccount: traderId =>
    apiClient.delete(`/accounts/${traderId}`, {
      apiCallId: apiCallIds.DELETE_ACCOUNT,
    }),

  internalTransfer: options =>
    apiClient.post('/transfers/internal-transfer', options, {
      apiCallId: apiCallIds.INTERNAL_TRANSFER,
    }),

  rebalanceUsd: traderId =>
    apiClient.post(`/accounts/${traderId}/rebalance-usd`, {}, {
      apiCallId: apiCallIds.REBALANCE_USD,
    }),

};
