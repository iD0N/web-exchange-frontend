import apiClient from '../apiClient';

export const apiCallIds = {
  LOG_EVENT: 'LOG_EVENT',
};

export default {
  logEvent: event =>
    apiClient.post(
      '/log',
      { event },
      {
        apiCallId: apiCallIds.LOG_EVENT,
      }
    ),
};
