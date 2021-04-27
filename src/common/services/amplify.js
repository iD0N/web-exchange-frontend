import Amplify, { Auth } from 'aws-amplify';
import qs from 'qs';
import { pascalCase } from 'change-case';

import { store } from '../../app/store/configureStore';
import config from '../../config';
import { AMPLIFY_ERROR_CODES } from '../enums';
import { silentReloginAction } from './user';
import {
  CognitoUser,
  CognitoUserSession,
  CognitoIdToken,
  CognitoRefreshToken,
  CognitoAccessToken,
} from 'amazon-cognito-identity-js';

import { logoutAction } from './user';
import i18n from './i18n';
import AlertService from './alert';

window.LOG_LEVEL = config().logLevel; // enable Amplify logger plus others

let amplify;

window.mobileUser = null;

export function configureAmplify() {
  // Custom method
  // nested in configure function, to not attach it in test env
  Auth.refreshSession = (cognitoUser, refreshToken) =>
    new Promise((resolve, reject) =>
      cognitoUser.refreshSession(refreshToken, (err, session) => {
        if (err) reject(err);
        resolve(session);
      })
    );

  const amplifyConfig = config().amplify;
  if (window.ReactNativeWebView) {
    // switch to mobile client
    amplifyConfig.userPoolWebClientId = amplifyConfig.userPoolMobileClientId;
  }

  amplify = Amplify.configure(amplifyConfig);

  //
  // The native mobile app calls this through a WebView injection
  //
  window.mobileLogin = async function(mobileSession) {
    const mobileRefreshToken = new CognitoRefreshToken({
      RefreshToken: mobileSession.refreshToken.token,
    });

    const localSession = new CognitoUserSession({
      IdToken: new CognitoIdToken({ IdToken: mobileSession.idToken.jwtToken }),
      RefreshToken: mobileRefreshToken,
      AccessToken: new CognitoAccessToken({ AccessToken: mobileSession.accessToken.jwtToken }),
    });

    const localUser = new CognitoUser({
      Username: mobileSession.accessToken.payload.username,
      Pool: Auth.userPool,
      Storage: Auth.userPool.storage,
    });
    localUser.setSignInUserSession(localSession);

    // pass along the device key (cached in storage and passed when refreshing session)
    localUser.deviceKey = mobileSession.accessToken.payload.device_key;
    localUser.cacheDeviceKeyAndPassword();

    window.mobileUser = localUser;

    try {
      // login failed?
      if (!(await Auth.currentAuthenticatedUser())) {
        console.error('mobile login failure');
        return;
      }
      store.dispatch(silentReloginAction());
    } catch (ex) {
      console.error(`mobile login excepction: ${ex}`);
    }
  };
}

export function getLoginUrl(provider) {
  const { userPoolWebClientId: clientId, oauth } = amplify;
  const { domain, redirectSignIn, responseType, scope } = oauth;

  const params = {
    redirect_uri: encodeURIComponent(redirectSignIn),
    response_type: responseType,
    client_id: clientId,
    scope: scope.join('+'),
    identity_provider: provider,
  };

  return `https://${domain}/oauth2/authorize?${qs.stringify(params, {
    encode: false,
  })}`;
}

export function handleAmplifyError(err) {
  const error = normalizeAmplifyError(err);

  if (
    [AMPLIFY_ERROR_CODES.NOT_AUTHENTICATED, AMPLIFY_ERROR_CODES.NO_CURRENT_USER].includes(
      error.code
    )
  ) {
    store.dispatch(logoutAction());
    return;
  }

  const key = `authErrors.${error.code}`;
  const message = i18n.exists(key) ? i18n.t(key) : error.message;
  AlertService.error(message);
}

function normalizeAmplifyError(error) {
  return typeof error === 'string'
    ? {
        code: pascalCase(error),
        message: error,
      }
    : error;
}
