import { call, put, select, takeLatest } from 'redux-saga/effects';
import { createSelector } from 'reselect';
import { push } from 'react-router-redux';
import { Auth } from 'aws-amplify';

import {
  fetchProfile,
  selectUserAttributes,
  selectUserInfo,
  selectTraderId,
} from '../../../../common/services/user';
import { t } from '../../../../common/services/i18n';
import AlertService from '../../../../common/services/alert';
import { handleAmplifyError } from '../../../../common/services/amplify';
import { withApiCall } from '../../../../common/services/spinner';
import { softReloadAppAction } from '../../../../common/services/webSocket';
import { createActionCreator } from '../../../../common/utils/reduxHelpers';
import { AMPLIFY_MFA_OPTIONS } from '../../../../common/enums';

/**
 * API CALLS
 */
export const apiCallIds = {
  CHANGE_PASSWORD: 'CHANGE_PASSWORD',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  ENABLE_MFA: 'ENABLE_MFA',
  DISABLE_MFA: 'DISABLE_MFA',
};

/**
 * ACTION TYPES
 */
export const CHANGE_PASSWORD = 'profile/CHANGE_PASSWORD';
export const UPDATE_PROFILE = 'profile/UPDATE_PROFILE';
export const ENABLE_MFA = 'profile/ENABLE_MFA';
export const DISABLE_MFA = 'profile/DISABLE_MFA';

/**
 * ACTIONS
 */
export const changePasswordAction = createActionCreator(CHANGE_PASSWORD);
export const updateProfileAction = createActionCreator(UPDATE_PROFILE);
export const enableMfaAction = createActionCreator(ENABLE_MFA);
export const disableMfaAction = createActionCreator(DISABLE_MFA);

/**
 * SELECTORS
 */
export const selectProfileIsLoaded = createSelector(
  selectTraderId,
  selectUserInfo,
  (traderId, userInfo) => !!traderId && !!userInfo
);

/**
 * SAGA HELPERS
 */
function* updateUserAttributes(attributes) {
  const user = yield call([Auth, Auth.currentAuthenticatedUser]);
  return yield call([Auth, Auth.updateUserAttributes], user, attributes);
}

/**
 * SAGAS
 */
const changePassword = withApiCall(apiCallIds.CHANGE_PASSWORD, function*({ payload }) {
  const { password, newPassword, confirmNewPassword } = payload;

  if (confirmNewPassword !== newPassword) {
    AlertService.error(
      t('notification.passwordMismatch', {
        defaultValue: 'New Password and Confirm New Password do not match.',
      })
    );
    return;
  }

  try {
    const user = yield call([Auth, Auth.currentAuthenticatedUser]);
    yield call([Auth, Auth.changePassword], user, password, newPassword);
    AlertService.success(
      t('notification.passwordChanged', { defaultValue: 'Password has been changed.' })
    );
    yield put(push('/settings/account'));
  } catch (error) {
    handleAmplifyError(error);
  }
});

const updateProfile = withApiCall(apiCallIds.UPDATE_PROFILE, function*({ payload: attributes }) {
  const { locale } = yield select(selectUserAttributes);
  try {
    yield call(updateUserAttributes, attributes);

    yield call(fetchProfile);
    AlertService.success(
      t('notification.profileUpdated', {
        defaultValue: 'Your profile information has been updated.',
        lng: attributes.locale,
      })
    );

    if (locale !== attributes.locale) {
      yield put(softReloadAppAction());
      return;
    }
  } catch (error) {
    handleAmplifyError(error);
  }
});

const enableMfa = withApiCall(apiCallIds.ENABLE_MFA, function*({ payload }) {
  const { code } = payload;

  try {
    const user = yield call([Auth, Auth.currentAuthenticatedUser]);
    yield call([Auth, Auth.verifyTotpToken], user, code);
    yield call([Auth, Auth.setPreferredMFA], user, AMPLIFY_MFA_OPTIONS.TOTP);
    yield call(fetchProfile);
    yield put(push('/settings/account'));
    AlertService.success(
      t('notification.enableMfaSuccess', {
        defaultValue: 'Multi-factor authentication has been successfully enabled.',
      })
    );
  } catch (error) {
    AlertService.error(
      t('notification.mfa.setupFailure', {
        defaultValue:
          'The one-time password you entered is incorrect. Please generate a new password with your app and try again.',
      })
    );
  }
});

const disableMfa = withApiCall(apiCallIds.DISABLE_MFA, function*() {
  try {
    const user = yield call([Auth, Auth.currentAuthenticatedUser]);
    yield call([Auth, Auth.setPreferredMFA], user, AMPLIFY_MFA_OPTIONS.NOMFA);
    yield call(fetchProfile);
    AlertService.success(
      t('notification.disableMfaSuccess', {
        defaultValue: 'Multi-factor authentication has been successfully disabled.',
      })
    );
    yield put(push('/settings/account'));
  } catch (error) {
    handleAmplifyError(error);
  }
});

export function* profileSaga() {
  yield takeLatest(CHANGE_PASSWORD, changePassword);
  yield takeLatest(UPDATE_PROFILE, updateProfile);
  yield takeLatest(ENABLE_MFA, enableMfa);
  yield takeLatest(DISABLE_MFA, disableMfa);
}
