import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import { call, put, fork, takeLatest, select } from 'redux-saga/effects';
import { push } from 'react-router-redux';
import { Auth } from 'aws-amplify';
import i18next from 'i18next';
import Cookies from 'universal-cookie';

import {
  LOGIN,
  LOGOUT,
  loginActions,
  relogin,
  fetchProfile,
  acceptTerms,
} from '../../common/services/user';
import { t } from '../../common/services/i18n';
import { AMPLIFY_ERROR_CODES, AMPLIFY_CHALLENGE_TYPES } from '../../common/enums';
import AlertService from '../../common/services/alert';
import { handleAmplifyError } from '../../common/services/amplify';
import { startApiCall, finishApiCall, withApiCall } from '../../common/services/spinner';
import {
  createActionCreator,
  createReducer,
  createActionType,
  REQUEST,
  SUCCESS,
} from '../../common/utils/reduxHelpers';

import { apiCallIds } from './api';

const cookies = new Cookies();

const getUsername = (email, mobile, mobilePrefix) => {
  if (mobile) {
    return `+${mobilePrefix}${mobile}`;
  }
  return email;
};

/**
 * ACTION TYPES
 */
export const CONFIRM_LOGIN = 'auth/CONFIRM_LOGIN';
export const STORE_CREDENTIALS = 'auth/STORE_CREDENTIALS';
export const SIGN_UP = 'auth/SIGN_UP';
export const VERIFY_EMAIL = 'auth/VERIFY_EMAIL';
export const RESEND_EMAIL_VERIFICATION = 'auth/RESEND_EMAIL_VERIFICATION';
export const FORGOTTEN_PASSWORD = 'auth/FORGOTTEN_PASSWORD';
export const RESET_PASSWORD = 'auth/RESET_PASSWORD';
export const SET_PRE_MFA_USER = 'auth/SET_PRE_MFA_USER';
export const UNSET_PRE_MFA_USER = 'auth/UNSET_PRE_MFA_USER';

/**
 * ACTIONS
 */
export const confirmLoginAction = createActionCreator(CONFIRM_LOGIN);
export const storeCredentialsAction = createActionCreator(STORE_CREDENTIALS);
export const signUpAction = createActionCreator(SIGN_UP);
export const verifyEmailAction = createActionCreator(VERIFY_EMAIL);
export const resendEmailVerificationAction = createActionCreator(RESEND_EMAIL_VERIFICATION);
export const forgottenPasswordAction = createActionCreator(FORGOTTEN_PASSWORD);
export const resetPasswordAction = createActionCreator(RESET_PASSWORD);
export const setPreMfaUserAction = createActionCreator(SET_PRE_MFA_USER);
export const unsetPreMfaUserAction = createActionCreator(UNSET_PRE_MFA_USER);

let inMemPassword;

/**
 * REDUCERS
 */
const initialState = {
  credentials: null,
  isLoggingOut: false,
  preMfaUser: false,
};

const credentials = createReducer(initialState.credentials, {
  [STORE_CREDENTIALS]: (state, payload) => payload,
  [LOGIN]: {
    [SUCCESS]: (state, payload) => {
      inMemPassword = undefined;
      return initialState.credentials;
    },
  },
});

const isLoggingOut = createReducer(initialState.isLoggingOut, {
  [LOGOUT]: (state, payload) => true,
});

const preMfaUser = createReducer(initialState.preMfaUser, {
  [SET_PRE_MFA_USER]: (_, payload) => payload,
  [UNSET_PRE_MFA_USER]: _ => false,
});

export default combineReducers({
  credentials,
  isLoggingOut,
  preMfaUser,
});

/**
 * SELECTORS
 */
export const selectAuth = state => state.auth;

export const selectCredentials = state => selectAuth(state).credentials || {};
export const selectIsLoggingOut = state => selectAuth(state).isLoggingOut;
export const selectPreMfaUser = state => selectAuth(state).preMfaUser;

export const selectEmailCredentialExists = createSelector(
  selectCredentials,
  credentials => !!credentials.email
);

export const selectMobileCredentialExists = createSelector(
  selectCredentials,
  credentials => !!credentials.mobile
);

/**
 * SAGAS
 */
export const login = withApiCall(apiCallIds.LOGIN, function*({ payload }) {
  const { email, mobile, mobilePrefix, password } = payload;
  inMemPassword = password;

  const username = getUsername(email, mobile, mobilePrefix);
  const isEmail = username === email;

  try {
    const user = yield call([Auth, Auth.signIn], username, password);
    if (user.challengeName === AMPLIFY_CHALLENGE_TYPES.SOFTWARE_TOKEN_MFA) {
      yield put(setPreMfaUserAction(user));
      yield put(push('/auth/confirm-login'));
    } else {
      yield call(fetchProfile);
      yield put(loginActions.success());
    }
  } catch (error) {
    if (error.code === AMPLIFY_ERROR_CODES.NOT_CONFIRMED) {
      if (username === email) {
        AlertService.success(
          t('notification.verifyEmail', {
            defaultValue: 'Please verify your e-mail before logging in.',
          })
        );

        yield put(storeCredentialsAction({ email }));
        yield put(push('/auth/verify-email'));
      } else {
        AlertService.success(
          t('notification.verifyMobile', {
            defaultValue: 'Please verify your mobile before logging in.',
          })
        );

        yield put(storeCredentialsAction({ mobile, mobilePrefix }));
        yield put(push('/auth/verify-mobile'));
      }
    } else if (error.code === AMPLIFY_ERROR_CODES.PASSWORD_RESET_REQUIRED) {
      yield call([Auth, Auth.forgotPassword], username);

      AlertService.success(
        t('notification.requirePasswordReset', {
          defaultValue:
            'Please set a new password to continue. A verification code has been sent to your e-mail.',
        })
      );

      yield put(storeCredentialsAction(isEmail ? { email } : { mobile, mobilePrefix }));
      yield put(push(isEmail ? '/auth/reset-password' : '/auth/reset-password-mobile'));
    } else {
      handleAmplifyError(error);
    }
  }
});

export function* confirmLogin({ payload }) {
  if (!payload.code) {
    return;
  }

  let userCreds = yield select(selectPreMfaUser);
  yield put(startApiCall({ apiCallId: apiCallIds.CONFIRM_LOGIN }));
  try {
    yield call(
      [Auth, Auth.confirmSignIn],
      userCreds,
      payload.code,
      AMPLIFY_CHALLENGE_TYPES.SOFTWARE_TOKEN_MFA
    );
    yield call(relogin);
    yield put(finishApiCall({ apiCallId: apiCallIds.CONFIRM_LOGIN }));
    yield put(unsetPreMfaUserAction());
  } catch (err) {
    AlertService.error(
      t('notification.mfa.failure', {
        defaultValue: 'The code you have entered is incorrect. Please try again.',
      })
    );
    yield put(finishApiCall({ apiCallId: apiCallIds.CONFIRM_LOGIN }));
  }
}

export const signUp = withApiCall(apiCallIds.SIGN_UP, function*({ payload }) {
  const { email, mobile, mobilePrefix, password, referralCode } = payload;
  inMemPassword = password;

  const username = getUsername(email, mobile, mobilePrefix);
  const isEmail = username === email;

  try {
    const resp = yield call([Auth, Auth.signUp], {
      username,
      password,
      attributes: {
        locale: i18next.language,
      },
    });

    if (!cookies.get('signup-skip-accept-terms')) {
      yield fork(acceptTerms, resp.userSub, referralCode, { username, isEmail }) ;
    }

    if (resp.userConfirmed) {
      yield call(login, { payload: { email, mobile, mobilePrefix, password }});
    } else {
      yield put(storeCredentialsAction(isEmail ? { email } : { mobile, mobilePrefix }));
      yield put(push(isEmail ? '/auth/verify-email' : '/auth/verify-mobile'));
    }
  } catch (error) {
    handleAmplifyError(error);
  }
});

export const verifyEmail = withApiCall(apiCallIds.VERIFY_EMAIL, function*({ payload }) {
  const { email = payload.email, mobile = payload.mobile, mobilePrefix = payload.mobilePrefix } = yield select(selectCredentials);

  const username = getUsername(email, mobile, mobilePrefix);
  const isEmail = username === email;

  try {
    yield call([Auth, Auth.confirmSignUp], username, payload.code);

    if (inMemPassword) {
      if (isEmail) {
        AlertService.success(
          t('notification.verification.password', {
            defaultValue: 'Your e-mail address has been verified. You will be logged-in now.',
          })
        );
      } else {
        AlertService.success(
          t('notification.mobileVerification.password', {
            defaultValue: 'Your mobile number has been verified. You will be logged-in now.',
          })
        );
      }
      yield call(login, { payload: { email, mobile, mobilePrefix, password: inMemPassword }});
      inMemPassword = undefined;
    } else {
      if (isEmail) {
        AlertService.success(
          t('notification.verification.noPassword', {
            defaultValue: 'Your e-mail address has been verified. You can log-in now.',
          })
        );
      } else {
        AlertService.success(
          t('notification.mobileVerification.noPassword', {
            defaultValue: 'Your mobile number has been verified. You can log-in now.',
          })
        );
      }
      yield put(push('/auth/login'));
    }
  } catch (error) {
    handleAmplifyError(error);
  }
});

export const resendEmailVerification = withApiCall(apiCallIds.RESEND_EMAIL_VERIFICATION, function*({
  payload,
}) {
  const { email = payload.email, mobile = payload.mobile, mobilePrefix = payload.mobilePrefix } = yield select(selectCredentials);

  const username = getUsername(email, mobile, mobilePrefix);

  try {
    yield call([Auth, Auth.resendSignUp], username);

    let notification;
    let defaultValue;

    if (username === email) {
      notification = 'notification.emailVerification';
      defaultValue = 'A new verification code has been sent to your e-mail.';
    }
    else {
      notification = 'notification.mobileVerification';
      defaultValue = 'A new verification code has been sent to your mobile';
    }

    AlertService.success(
      t(notification, {
        defaultValue: defaultValue,
      })
    );
  } catch (error) {
    handleAmplifyError(error);
  }
});

export const forgottenPassword = withApiCall(apiCallIds.FORGOTTEN_PASSWORD, function*({ payload }) {
  const { email, mobile, mobilePrefix } = payload;

  const username = getUsername(email, mobile, mobilePrefix);
  const isEmail = username === email;

  try {
    yield call([Auth, Auth.forgotPassword], username);

    if (isEmail) {
      AlertService.success(
        t('notification.forgottenPassword', {
          defaultValue: 'An e-mail with further instructions has been sent to your e-mail address.',
        })
      );
    } else {
      AlertService.success(
        t('notification.forgottenPasswordMobile', {
          defaultValue: 'A text has been sent to your mobile number with a reset code. Use this code to confirm your password reset.',
        })
      );
    }

    yield put(storeCredentialsAction(isEmail ? { email } : { mobile, mobilePrefix }));

    yield put(push(isEmail ? '/auth/reset-password' : '/auth/reset-password-mobile'));
  } catch (error) {
    handleAmplifyError(error);
  }
});

export const resetPassword = withApiCall(apiCallIds.RESET_PASSWORD, function*({ payload }) {
  const { code, password, confirmNewPassword } = payload;
  const { email = payload.email, mobile = payload.mobile, mobilePrefix = payload.mobilePrefix } = yield select(selectCredentials);

  if (confirmNewPassword !== password) {
    AlertService.error(
      t('notification.passwordMismatch', {
        defaultValue: 'New Password and Confirm New Password do not match.',
      })
    );
    return;
  }

  const username = getUsername(email, mobile, mobilePrefix);

  try {
    yield call([Auth, Auth.forgotPasswordSubmit], username, code, password);

    AlertService.success(
      t('notification.passwordReset', {
        defaultValue: 'Password has been changed. You will be logged-in now.',
      })
    );

    yield call(login, { payload: { email, mobile, mobilePrefix, password }});
  } catch (error) {
    handleAmplifyError(error);
  }
});

export function* authSaga() {
  yield takeLatest(createActionType(LOGIN, REQUEST), login);
  yield takeLatest(SIGN_UP, signUp);
  yield takeLatest(VERIFY_EMAIL, verifyEmail);
  yield takeLatest(RESEND_EMAIL_VERIFICATION, resendEmailVerification);
  yield takeLatest(FORGOTTEN_PASSWORD, forgottenPassword);
  yield takeLatest(RESET_PASSWORD, resetPassword);
  yield takeLatest(CONFIRM_LOGIN, confirmLogin);
}
