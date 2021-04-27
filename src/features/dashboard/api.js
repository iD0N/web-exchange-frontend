import apiClient from '../../common/services/apiClient';

export const apiCallIds = {
  GET_SUMMARY: 'dashboard/GET_SUMMARY',
};

export default {
  getSummary: () =>
    apiClient.get('/contracts/active/summary', {
      apiCallId: apiCallIds.GET_SUMMARY,
      keepCase: true,
    }),
};
