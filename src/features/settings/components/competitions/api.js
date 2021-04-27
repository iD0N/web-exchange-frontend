import apiClient from '../../../../common/services/apiClient';

export const apiCallIds = {
  GET_COMPETITION: 'competitions/COMPETITION_DATA',
  GET_COMPETITIONS: 'settings/COMPETITIONS_DATA',
  JOIN_COMPETITION: 'settings/JOIN_COMPETITION',
  CREATE_COMPETITION: 'settings/CREATE_COMPETITION',
  UPDATE_ACCOUNT_ALIAS: 'UPDATE_ACCOUNT_ALIAS',
  GET_COMPETITION_REFERRAL_CODE: 'competitions/GET_COMPETITION_REFERRAL_CODE',
};

export default {
  getCompetition: (competitionId, contractCode) =>
    apiClient.get(
      `/competition/${competitionId}${contractCode ? `?contract_code=${contractCode}` : ''}`,
      {
        apiCallId: apiCallIds.GET_COMPETITION,
        keepCase: true,
      }
    ),

  getCompetitions: accountId =>
    apiClient.get(`/accounts/${accountId}/competitions`, {
      apiCallId: apiCallIds.GET_COMPETITIONS,
    }),

  joinCompetition: (accountId, payload) =>
    apiClient.post(`/accounts/${accountId}/competitions`, payload, {
      apiCallId: apiCallIds.JOIN_COMPETITION,
    }),

  createCompetition: (accountId, payload) =>
    apiClient.post(`/accounts/${accountId}/create-competition`, payload, {
      apiCallId: apiCallIds.CREATE_COMPETITION,
    }),

  getCreatedByReferralCode: competitionCode =>
    apiClient.get(`/affiliate/${competitionCode}`, {
      apiCallId: apiCallIds.GET_COMPETITION_REFERRAL_CODE,
    }),
};
