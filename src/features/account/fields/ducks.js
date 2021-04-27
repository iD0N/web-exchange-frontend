import { createSelector } from 'reselect';
import { call, put, fork, takeLatest } from 'redux-saga/effects';
import { push } from 'react-router-redux';
import { Auth } from 'aws-amplify';

import {
  acceptTerms,
  selectProfile,
  refreshSession,
  fetchProfile,
} from '../../../common/services/user';
import { t } from '../../../common/services/i18n';
import AlertService from '../../../common/services/alert';
import { handleAmplifyError } from '../../../common/services/amplify';
import { withApiCall } from '../../../common/services/spinner';
import { createActionCreator } from '../../../common/utils/reduxHelpers';

const EMAIL = 'email';

export const apiCallIds = {
  CREATE_ACCOUNT: 'CREATE_ACCOUNT',
  VERIFY_USER_EMAIL_INIT: 'VERIFY_USER_EMAIL_INIT',
  VERIFY_USER_EMAIL_SUBMIT: 'VERIFY_USER_EMAIL_SUBMIT',
  CHANGE_EMAIL: 'CHANGE_EMAIL',
};

/**
 * ACTION TYPES
 */
export const CREATE_ACCOUNT = 'fields/CREATE_ACCOUNT';
export const VERIFY_USER_EMAIL_INIT = 'fields/VERIFY_USER_EMAIL_INIT';
export const VERIFY_USER_EMAIL_SUBMIT = 'fields/VERIFY_USER_EMAIL_SUBMIT';
export const CHANGE_EMAIL = 'fields/CHANGE_EMAIL';

/**
 * ACTIONS
 */
export const createAccountAction = createActionCreator(CREATE_ACCOUNT);
export const verifyUserEmailInitAction = createActionCreator(VERIFY_USER_EMAIL_INIT);
export const verifyUserEmailSubmitAction = createActionCreator(VERIFY_USER_EMAIL_SUBMIT);
export const changeEmailAction = createActionCreator(CHANGE_EMAIL);

/**
 * SELECTORS
 */
export const selectMissingFields = createSelector(selectProfile, profile =>
  !!profile && profile.missingRequiredFields && profile.missingRequiredFields !== null
    ? profile.missingRequiredFields
    : []
);

export const selectIsMissingAgreements = createSelector(selectMissingFields, missingFields =>
  missingFields.includes('agreements')
);

export const selectIsMissingEmail = createSelector(selectMissingFields, missingFields =>
  missingFields.includes('email')
);

export const selectIsMissingVerifiedEmail = createSelector(selectMissingFields, missingFields =>
  missingFields.includes('email_verified')
);

export const selectHasMissingFields = createSelector(
  selectMissingFields,
  missingFields => !!(missingFields && missingFields.length)
);

/**
 * SAGA HELPERS
 */
export function* acceptTermsAndRefreshSession(sub, referralCode) {
  yield call(acceptTerms, sub, referralCode);
  yield call(refreshSession);
  yield call(fetchProfile);
}

/**
 * SAGAS
 */
export const createAccount = withApiCall(apiCallIds.CREATE_ACCOUNT, function*({ payload }) {
  const { agreements, email, referralCode } = payload;
  const { idToken } = yield call([Auth, Auth.currentSession]);

  if (email) {
    if (agreements) {
      // running in background, so meanwhile the user can verify email
      yield fork(acceptTermsAndRefreshSession, idToken.payload.sub, referralCode);
    }

    try {
      const user = yield call([Auth, Auth.currentAuthenticatedUser]);
      yield call([Auth, Auth.updateUserAttributes], user, { email });
      yield call(refreshSession);
      yield call(fetchProfile);
      yield put(push('/fields/verify-email'));
    } catch (error) {
      handleAmplifyError(error);
    }
  } else {
    yield call(acceptTermsAndRefreshSession, idToken.payload.sub, referralCode);
    yield put(push('/'));
  }
});

const verifyUserEmailInit = withApiCall(apiCallIds.VERIFY_USER_EMAIL_INIT, function*() {
  try {
    yield call([Auth, Auth.verifyCurrentUserAttribute], EMAIL);

    AlertService.success(
      t('notification.emailVerification', {
        defaultValue: 'A new verification code has been sent to your e-mail.',
      })
    );
  } catch (error) {
    handleAmplifyError(error);
  }
});

const verifyUserEmailSubmit = withApiCall(apiCallIds.VERIFY_USER_EMAIL_SUBMIT, function*({
  payload,
}) {
  const { code } = payload;

  try {
    yield call([Auth, Auth.verifyCurrentUserAttributeSubmit], EMAIL, code);
    yield call(refreshSession);
    yield call(fetchProfile);
    yield put(push('/settings/account'));
  } catch (error) {
    handleAmplifyError(error);
  }
});

const changeEmail = withApiCall(apiCallIds.CHANGE_EMAIL, function*({ payload: attributes }) {
  try {
    const user = yield call([Auth, Auth.currentAuthenticatedUser]);
    yield call([Auth, Auth.updateUserAttributes], user, attributes);

    AlertService.success(
      t('notification.changeEmailSuccess', {
        defaultValue: 'Your email has been updated.',
      })
    );

    yield call(refreshSession);
    yield call(fetchProfile);
    yield put(push('/fields/verify-email'));
  } catch (error) {
    handleAmplifyError(error);
  }
});

export function* fieldsSaga() {
  yield takeLatest(CREATE_ACCOUNT, createAccount);
  yield takeLatest(VERIFY_USER_EMAIL_INIT, verifyUserEmailInit);
  yield takeLatest(VERIFY_USER_EMAIL_SUBMIT, verifyUserEmailSubmit);
  yield takeLatest(CHANGE_EMAIL, changeEmail);
}
