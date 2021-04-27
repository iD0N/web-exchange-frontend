import { Auth } from 'aws-amplify';
import { ExponentialBackoff } from 'simple-backoff';

import { store } from '../../../app/store/configureStore';
import { toSnakeCase, toCamelCase } from '../../utils/apiHelpers';

import { BACKOFF_OPTIONS } from './constants';

export async function getAuthTokens() {
  let auth = {};

  try {
    const { idToken, accessToken } = await Auth.currentSession();

    auth = {
      idToken: idToken.jwtToken,
      accessToken: accessToken.jwtToken,
    };
    const { user = {} } = store.getState();
    if (user.traderId) {
      auth.traderId = user.traderId;
    }
  } catch (err) {}

  return auth;
}

export function parseMessageData(msg) {
  let data = {};

  try {
    data = JSON.parse(msg.data);
  } catch (err) {}

  return toCamelCase(data);
}

export function stringifyMessageData(msg) {
  return JSON.stringify(toSnakeCase(msg));
}

export function initBackoff() {
  return new ExponentialBackoff(BACKOFF_OPTIONS);
}
