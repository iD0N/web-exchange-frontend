import apiClient from '../../../../common/services/apiClient';

export const apiCallIds = {
  GET_LEDGER: 'GET_LEDGER',
  GET_LEDGER_SUMMARY: 'GET_LEDGER_SUMMARY',
};

export default {
  getLedger: accountId =>
    apiClient.get(`/accounts/${accountId}/ledger?descending=true`, {
      apiCallId: apiCallIds.GET_LEDGER,
    }),

  getLedgerSummary: (accountId, asCsv) =>
    apiClient.get(`/accounts/${accountId}/ledger-summary${asCsv ? '?format=csv' : ''}`, {
      apiCallId: apiCallIds.GET_LEDGER_SUMMARY,
    }),
};
