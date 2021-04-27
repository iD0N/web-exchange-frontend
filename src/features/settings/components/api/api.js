import apiClient from '../../../../common/services/apiClient';

export const apiCallIds = {
  GET_KEYS: 'GET_KEYS',
  CREATE_KEY: 'CREATE_KEY',
  DELETE_KEY: 'DELETE_KEY',
};

export default {
  getKeys: () =>
    apiClient.get('/keys', {
      apiCallId: apiCallIds.GET_KEYS,
    }),

  createKey: (options = { read: true, write: true, transfer: true }) =>
    apiClient.post('/keys', options, {
      apiCallId: apiCallIds.CREATE_KEY,
    }),

  deleteKey: key =>
    apiClient.delete(`/keys/${key}`, {
      apiCallId: apiCallIds.DELETE_KEY,
    }),
};
