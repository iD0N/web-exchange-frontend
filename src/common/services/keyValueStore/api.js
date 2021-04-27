import apiClient from '../apiClient';

export default {
  getValue: (key, options) => apiClient.get(`/user/json/${key}`, options),

  setValue: (key, value, options) =>
    apiClient.put(`/user/json/${key}`, value, {
      apiCallId: null,
      ...options,
    }),
};
