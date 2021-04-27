import apiClient from '../../common/services/apiClient';

export const apiCallIds = {
  GET_LEADERBOARD: 'leaderboard/GET_LEADERBOARD',
};

export default {
  getLeaderboard: () =>
    apiClient.get('/leaderboard', {
      apiCallId: apiCallIds.GET_LEADERBOARD,
      keepCase: true,
    }),
};
