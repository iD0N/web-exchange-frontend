import { createSelector } from 'reselect';
import { combineReducers } from 'redux';
import { call, put, race, select, takeLatest, delay } from 'redux-saga/effects';
import { push } from 'react-router-redux';

import { CONTACT_EMAIL } from '../../../config';
import {
  refreshSession,
  fetchProfile,
  selectKycStatus,
  selectKycFailureReason,
} from '../../../common/services/user';
import { t } from '../../../common/services/i18n';
import AlertService from '../../../common/services/alert';
import {
  createActionCreator,
  createApiActionCreators,
  createActionType,
  createReducer,
  REQUEST,
  SUCCESS,
} from '../../../common/utils/reduxHelpers';
import { KYC_STATUS } from '../../../common/enums';
import { withApiCall } from '../../../common/services/spinner';

import { KYC_FAILURE_REASONS } from '../constants';
import api from './api';

export const apiCallIds = {
  COMPLETE_KYC: 'COMPLETE_KYC',
};

/**
 * ACTION TYPES
 */
export const INITIATE_KYC = 'onboard/INITIATE_KYC';
export const COMPLETE_KYC = 'onboard/COMPLETE_KYC';

/**
 * ACTIONS
 */
export const initiateKycActions = createApiActionCreators(INITIATE_KYC);
export const completeKycAction = createActionCreator(COMPLETE_KYC);

/**
 * REDUCERS
 */
const initialState = {
  jumioRedirectUrl: null,
  jumioTransactionReference: null,
};

const jumioRedirectUrl = createReducer(initialState.jumioRedirectUrl, {
  [INITIATE_KYC]: {
    [SUCCESS]: (state, payload) => payload.jumioRedirectUrl,
  },
  [COMPLETE_KYC]: () => initialState.jumioRedirectUrl,
});

const jumioTransactionReference = createReducer(initialState.jumioTransactionReference, {
  [INITIATE_KYC]: {
    [SUCCESS]: (state, payload) => payload.jumioTransactionReference,
  },
  [COMPLETE_KYC]: () => initialState.jumioTransactionReference,
});

export default combineReducers({
  jumioRedirectUrl,
  jumioTransactionReference,
});

/**
 * SELECTORS
 */
export const selectIdentity = state => state.identity;

export const selectJumioRedirectUrl = state => selectIdentity(state).jumioRedirectUrl;
export const selectJumioTransactionReference = state =>
  selectIdentity(state).jumioTransactionReference;

export const selectIsKycProcessing = createSelector(selectKycStatus, kycStatus =>
  [KYC_STATUS.PROCESSING, KYC_STATUS.PROCESSING_MANUAL].includes(kycStatus)
);

export const selectIsKycProcessingManual = createSelector(selectKycStatus, kycStatus =>
  [KYC_STATUS.PROCESSING_MANUAL].includes(kycStatus)
);

export const selectIsKycPassed = createSelector(
  selectKycStatus,
  kycStatus => kycStatus === KYC_STATUS.PASSED
);

export const selectIsKycRetryable = createSelector(selectKycStatus, kycStatus =>
  [KYC_STATUS.FAILED_RETRYABLE].includes(kycStatus)
);

export const selectIsKycFailed = createSelector(selectKycStatus, kycStatus =>
  [KYC_STATUS.FAILED].includes(kycStatus)
);

export const selectIsKycNotStarted = createSelector(selectKycStatus, kycStatus =>
  [KYC_STATUS.NOT_STARTED, KYC_STATUS.FAILED_RETRYABLE].includes(kycStatus)
);

export const selectIsKycCompleted = createSelector(selectKycStatus, kycStatus =>
  [KYC_STATUS.PASSED, KYC_STATUS.FAILED_RETRYABLE, KYC_STATUS.FAILED].includes(kycStatus)
);

/**
 * HELPER FUNCTIONS
 */
function sendGAEvent(transactionStatus, errorCode) {
  if (transactionStatus) {
    // Google Analytics object
    const { ga } = window;
    if (ga && ga.getAll) {
      const errorLabel = errorCode ? `-${errorCode}` : '';

      // TODO(AustinC): replace this event tracking code with GTM code:
      // https://support.google.com/tagmanager/answer/6106716
      const [tracker] = ga.getAll();
      if (tracker) {
        tracker.send('event', 'KYC', 'complete', `${transactionStatus}${errorLabel}`);
      }
    }
  }
}

/**
 * SAGAS
 */
function* initiateKyc({ payload }) {
  const resp = yield call(api.initiateKyc, payload);

  if (resp.ok) {
    yield put(initiateKycActions.success(resp.data));
  } else {
    AlertService.error(
      t('notification.initiateKyc.error', {
        defaultValue: 'Unable to initiate KYC. Please try again later.',
      })
    );
  }
}

const completeKyc = withApiCall(apiCallIds.COMPLETE_KYC, function*({ payload }) {
  const { jumioTransactionStatus, jumioErrorCode } = payload;
  sendGAEvent(jumioTransactionStatus, jumioErrorCode);

  if (jumioTransactionStatus === 'ERROR') {
    return;
  }

  yield call(api.kycPending, payload);

  function* sessionPolling() {
    let delta = 1000;
    while (true) {
      yield delay(delta);
      delta = Math.min(delta * 2, 60 * 1000); // min of 2x delta or 60s

      yield call(refreshSession);
      yield call(fetchProfile);

      if (!(yield select(selectIsKycProcessing))) {
        const reasonKey = yield select(selectKycFailureReason);

        if (reasonKey && KYC_FAILURE_REASONS[reasonKey]) {
          AlertService.error(KYC_FAILURE_REASONS[reasonKey], 6);
          put(push('/identity'));
        } else if (yield select(selectIsKycPassed)) {
          AlertService.success(
            t('notification.completeKyc.success', {
              defaultValue: 'Your identity has been verified.',
            })
          );
        } else {
          AlertService.error(
            t('notification.completeKyc.failed', {
              email: CONTACT_EMAIL,
              defaultValue:
                'Your identity could not be verified. Please contact our support at {{email}}.',
            })
          );
        }

        return;
      }
    }
  }

  yield race([
    call(sessionPolling),
    delay(10 * 60 * 1000), // timeout at 10 minutes
  ]);
});

export function* identitySaga() {
  yield takeLatest(createActionType(INITIATE_KYC, REQUEST), initiateKyc);
  yield takeLatest(COMPLETE_KYC, completeKyc);
}
