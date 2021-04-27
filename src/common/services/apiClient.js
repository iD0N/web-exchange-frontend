import axios from 'axios';
import { Auth } from 'aws-amplify';
import qs from 'qs';
import { compose } from 'redux';

import { store } from '../../app/store/configureStore';
import config from '../../config';
import { toSnakeCase, toCamelCase } from '../utils/apiHelpers';

import { finishApiCall, setConnectedStatus, startApiCall } from './spinner';
import { logoutAction } from './user';
import AlertService from './alert';
import { reportError } from './sentry';

const RATE_LIMIT_STATUS_CODE = 429;

const apiClient = axios.create({
  //responseType: 'json',
  baseURL: config().apiURL,
  paramsSerializer: compose(qs.stringify, toSnakeCase),
  transformRequest: [
    ...axios.defaults.transformRequest,
    requestData => {
      if (requestData) {
        const data = JSON.parse(requestData);

        if (typeof data === 'object') {
          return JSON.stringify(toSnakeCase(data));
        }
      }

      return requestData;
    },
  ],
});

export default apiClient;

apiClient.interceptors.request.use(async config => {
  if (!config.public) {
    try {
      const session = await Auth.currentSession();
      if (session) {
        config.headers.common = config.headers.common || {};
        config.headers.common['Authorization'] = `Bearer ${session.accessToken.jwtToken}`;
        config.headers.common['X-User-Id-Token'] = session.idToken.jwtToken;

        const { user = {} } = store.getState();
        if (user.traderId) {
          config.headers.common['X-Trader-Id'] = user.traderId;
        }
      }
    } catch (error) {}
  }

  store.dispatch(
    startApiCall({
      apiCallId: config.apiCallId,
    })
  );

  return config;
});

apiClient.interceptors.response.use(
  response => {
    store.dispatch(
      finishApiCall({
        apiCallId: response.config.apiCallId,
      })
    );

    store.dispatch(setConnectedStatus(true));

    const { data } = response;

    if (!data || typeof data === 'string' || (data && response.config.keepCase)) {
      return normalizeSuccessResponse(response);
    }

    return normalizeSuccessResponse({ ...response, data: toCamelCase(data) });
  },
  error => {
    const statusCode = !!error.response && error.response.status;
    if (statusCode === RATE_LIMIT_STATUS_CODE) {
      reportError(error, error.config, true);
    }

    if (!axios.isCancel(error)) {
      store.dispatch(
        finishApiCall({
          apiCallId: error.config.apiCallId,
          error,
        })
      );

      if (!(error.config.ignoreError && error.config.ignoreError(error))) {
        if (!statusCode || statusCode > 500) {
          store.dispatch(setConnectedStatus(false));
        } else if (statusCode && statusCode === 401) {
          // unauthorized
          store.dispatch(logoutAction());
          return;
        } else {
          showErrorMessage(error);
        }
      }
    }

    return normalizeErrorResponse(error);
  }
);

function normalizeSuccessResponse(response) {
  return {
    ...response,
    ok: true,
  };
}

function normalizeErrorResponse(error) {
  return {
    ...error,
    ok: false,
  };
}

function showErrorMessage(error) {
  const errorMsg = extractErrorMsg(error);

  if (Array.isArray(errorMsg)) {
    errorMsg.forEach(err => AlertService.error(`${err}`, 5));
  } else if (errorMsg) {
    AlertService.error(`${errorMsg}`);
  }
}

function suppressCompetitionErrors(error) {
  return typeof error === 'string' && error.match('competition') ? false : error;
}

function extractErrorMsg(error) {
  return suppressCompetitionErrors(
    error.response && error.response.data
      ? error.response.data.message ||
          (error.response.data.error && error.response.data.error.inner
            ? error.response.data.error.inner
            : error)
      : error
  );
}
