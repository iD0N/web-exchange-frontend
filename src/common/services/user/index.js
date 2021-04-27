import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import { all, call, put, takeLatest, takeEvery, select } from 'redux-saga/effects';
import { Auth } from 'aws-amplify';
import i18next from 'i18next';
import localStorage from 'localStorage';
import moment from 'moment';
import Cookies from 'universal-cookie';
import BigNumber from 'bignumber.js';

import {
  createActionCreator,
  createActionType,
  createApiActionCreators,
  createReducer,
  REQUEST,
  SUCCESS,
  FAILURE,
} from '../../utils/reduxHelpers';
import { AMPLIFY_CHALLENGE_TYPES, KYC_STATUS } from '../../enums';
import { handleAmplifyError } from '../amplify';
import { setUserContext, setTags } from '../sentry';
import { persistor } from '../../../app/store/configureStore';
import { RECEIVE_MESSAGE, UPDATE_ACTIVITY_PERIOD_KEY, softReloadAppAction } from '../webSocket';
import { WS_CHANNELS, WS_DATA_TYPES } from '../webSocket/constants';
import { finishApiCall, startApiCall } from '../spinner';

import api, { apiCallIds } from './api';
import { isDevStage, isProd, isTestnet } from '../../../config';

/**
 * ACTION TYPES
 */
export const SILENT_RELOGIN = 'user/SILENT_RELOGIN';
export const RELOGIN = 'user/RELOGIN';
export const LOGIN = 'user/LOGIN';
export const LOGOUT = 'user/LOGOUT';
export const STORE_PROFILE = 'user/STORE_PROFILE';
export const REFRESH_PROFILE = 'user/REFRESH_PROFILE';
export const FETCH_AFFILIATE = 'user/FETCH_AFFILIATE';
export const INITIALIZE_REWARDS = 'user/INITIALIZE_REWARDS';
export const UPDATE_REWARDS = 'user/UPDATE_REWARDS';
export const ACCEPT_ACDX_TOKEN_TERMS = 'user/ACCEPT_ACDX_TOKEN_TERMS';
export const UPDATE_ACDX_TOKEN_TERMS = 'user/UPDATE_ACDX_TOKEN_TERMS';
export const SET_TRADER_ID = 'user/SET_TRADER_ID';
export const CHANGE_LOCALE = 'user/CHANGE_LOCALE';
export const GET_MAX_LEVERAGE = 'user/GET_MAX_LEVERAGE';
export const SET_MAX_LEVERAGE = 'user/SET_MAX_LEVERAGE';

/**
 * ACTIONS
 */
export const silentReloginAction = createActionCreator(SILENT_RELOGIN);
export const reloginAction = createActionCreator(RELOGIN);
export const loginActions = createApiActionCreators(LOGIN);
export const logoutAction = createActionCreator(LOGOUT);
export const storeProfileAction = createActionCreator(STORE_PROFILE);
export const refreshProfileAction = createActionCreator(REFRESH_PROFILE);
export const fetchAffiliateAction = createApiActionCreators(FETCH_AFFILIATE);
export const initializeRewardsAction = createActionCreator(INITIALIZE_REWARDS);
export const updateRewardsAction = createActionCreator(UPDATE_REWARDS);
export const acceptACDXTokenTermsAction = createActionCreator(ACCEPT_ACDX_TOKEN_TERMS);
export const updateACDXTokenTermsAction = createActionCreator(UPDATE_ACDX_TOKEN_TERMS);
export const setTraderIdAction = createActionCreator(SET_TRADER_ID);
export const changeLocaleAction = createActionCreator(CHANGE_LOCALE);
export const getMaxLeverageActions = createApiActionCreators(GET_MAX_LEVERAGE);
export const setMaxLeverageActions = createApiActionCreators(SET_MAX_LEVERAGE);

const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;
const SEVEN_DAYS = 1000 * 60 * 60 * 24 * 7;
const SIX_HOURS = 1000 * 60 * 60 * 6;

// app logs the user out on their next load within 6 hours of session expiration
const MAX_SESSION_DURATION = window.ReactNativeWebView
  ? THIRTY_DAYS - SIX_HOURS // mobile sessions last 30 days
  : SEVEN_DAYS - SIX_HOURS; // web sessions last 7 days

const cookies = new Cookies();

const clearCookies = () => {
  const domain = isDevStage() ? 'localhost' : '.acdx.io';
  Object.keys(cookies.getAll()).forEach(name => cookies.remove(name, { path: '/', domain }));
};

export function logoutOnStorageChange({ key }) {
  if (key === 'logout-event') {
    clearCookies();
    window.location.reload();
  }
}

function loginOnStorageChange({ key }) {
  if (key === 'login-event') {
    if (!window.location.pathname.match('logout')) {
      window.location.reload();
    } else {
      window.location.href = '/trader';
    }
  }
}

/**
 * REDUCERS
 */
const initialState = {
  profile: null,
  isAuthenticating: false,
  affiliate: null,
  rewards: {
    loaded: false,
    data: {},
  },
  traderId: null,
  maxLeverage: null,
};

const profile = createReducer(initialState.profile, {
  [STORE_PROFILE]: (state, profile) => profile,
  [LOGIN]: {
    [FAILURE]: (state, payload) => initialState.profile,
  },
});

const isAuthenticating = createReducer(initialState.isAuthenticating, {
  [RELOGIN]: (state, payload) => true,
  [LOGIN]: {
    [REQUEST]: (state, payload) => true,
    [SUCCESS]: (state, payload) => false,
    [FAILURE]: (state, payload) => false,
  },
});

const affiliate = createReducer(initialState.affiliate, {
  [FETCH_AFFILIATE]: {
    [SUCCESS]: (state, affiliate) => affiliate,
  },
  [UPDATE_ACDX_TOKEN_TERMS]: (_, affiliate) => ({
    ..._,
    acdxTokenTermsAcceptedAt: moment().toISOString(),
  }),
});

const rewards = createReducer(initialState.rewards, {
  [INITIALIZE_REWARDS]: (_, data) => ({ loaded: true, data }),
  [UPDATE_REWARDS]: (_, data) => ({ loaded: true, data }),
});

const traderId = createReducer(initialState.traderId, {
  [SET_TRADER_ID]: (_, traderId) => traderId,
});

const maxLeverage = createReducer(initialState.maxLeverage, {
  [GET_MAX_LEVERAGE] : {
    [SUCCESS]: (state, max) => Number(max),
  },
  [SET_MAX_LEVERAGE]: {
    [SUCCESS]: (state, max) => Number(max),
  }
});

export default combineReducers({
  profile,
  isAuthenticating,
  affiliate,
  rewards,
  traderId,
  maxLeverage,
});

/**
 * SELECTORS
 */
export const selectUser = state => state.user;

export const selectProfile = state => selectUser(state).profile;
export const selectIsAuthenticating = state => selectUser(state).isAuthenticating;
export const selectAffiliate = state => selectUser(state).affiliate;
export const selectRewards = state => selectUser(state).rewards || { loaded: false };
export const selectTraderId = state => selectUser(state).traderId || (state.accounts[0] || {}).traderId;
export const selectMaxLeverage = state => selectUser(state).maxLeverage;

export const selectRewardsParsed = createSelector(
  selectRewards,
  ({ data = { attributes: [], volumeDetails: { totalVolume: 0 } }, loaded }) => {
    if (!loaded) {
      return { loaded: false };
    }

    const volumeAttr = data.attributes.find(({ attribute }) => attribute === 'volume_tier') || {};
    const acdxAttr = data.attributes.find(({ attribute }) => attribute === 'acdx_tier') || {};

    const activeRewards = data.attributes.reduce(
      (arr, { activeRewards, attribute }) => [
        ...arr,
        ...activeRewards.map(item => ({ ...item, attribute })),
      ],
      []
    );

    const rewardsByType = {};
    activeRewards.forEach(item => {
      if (item.type === 'fee_discount' && rewardsByType[item.type]) {
        // fee discounts "stack"
        const { value, expiresAt } = rewardsByType[item.type];
        const oldFee = BigNumber(1).minus(value);
        const newFee = BigNumber(1).minus(item.value);
        rewardsByType[item.type] = {
          type: item.type,
          // report aggregate fee
          value: BigNumber(1)
            .minus(oldFee.times(newFee))
            .toFixed(4),
          // report nearest expiration
          expiresAt: moment(expiresAt).isBefore(item.expiresAt)
            ? expiresAt
            : item.expiresAt || expiresAt,
        };
      } else {
        // other rewards don't stack
        if (
          !rewardsByType[item.type] ||
          BigNumber(item.value).isGreaterThan(rewardsByType[item.type].value)
        ) {
          rewardsByType[item.type] = item;
        }
      }
    });

    return {
      loaded: true,
      volume: {
        ...volumeAttr,
        amount: data.volumeDetails.totalVolume,
        nextTierRequirement: volumeAttr.nextTierRequirement,
      },
      acdx: acdxAttr,
      rewards: Object.entries(rewardsByType).map(([key, item]) => item),
    };
  }
);

export const selectUserInfo = createSelector(selectProfile, profile => profile && profile.userInfo);
export const selectPreferredMfa = createSelector(
  selectProfile,
  profile => profile && profile.preferredMfa
);

export const selectIsLoggedIn = createSelector(selectProfile, profile => !!profile);

export const selectCognitoUsername = createSelector(selectUserInfo, userInfo =>
  userInfo ? userInfo.username : undefined
);

export const selectUserAttributes = createSelector(selectUserInfo, userInfo => {
  const attributes = (userInfo && userInfo.attributes) || {};

  const {
    email = '',
    given_name = '',
    family_name = '',
    locale = i18next.language,
    ...rest
  } = attributes;

  return { email, given_name, family_name, locale, ...rest };
});

export const selectIsMfaEnabled = createSelector(
  selectPreferredMfa,
  preferredMfa => preferredMfa === AMPLIFY_CHALLENGE_TYPES.SOFTWARE_TOKEN_MFA
);

export const selectUserEmail = createSelector(
  selectUserAttributes,
  attributes => attributes && attributes.email
);

export const selectCognitoSub = createSelector(
  selectUserAttributes,
  attributes => attributes && attributes.sub
);

export const selectKycModel = createSelector(selectProfile, profile => profile && profile.kycModel);

export const selectKycStatus = createSelector(
  selectKycModel,
  kycModel => kycModel && kycModel.status
);

export const selectHasStartedKyc = createSelector(
  selectKycStatus,
  status => ![KYC_STATUS.NOT_STARTED, KYC_STATUS.FAILED_RETRYABLE].includes(status)
);

export const selectKycFailureReason = createSelector(
  selectKycModel,
  kycModel => kycModel && kycModel.failureReason
);

export const selectIsSocialUser = createSelector(
  selectProfile,
  profile => profile && !!profile.identities
);

export const selectEntitlements = createSelector(
  selectProfile,
  profile => profile && profile.entitlements
);

export const selectAuthTime = createSelector(selectProfile, profile => profile && profile.authTime);

export const selectHasAppAccess = createSelector(
  selectEntitlements,
  selectIsLoggedIn,
  (entitlements, loggedIn) =>
    loggedIn ? !!(entitlements && entitlements.includes('app_access')) : true
);

export const selectHasLoggedInAppAccess = createSelector(
  selectEntitlements,
  selectIsLoggedIn,
  (entitlements, loggedIn) => loggedIn && !!(entitlements && entitlements.includes('app_access'))
);

export const selectHasFundsTransfer = createSelector(selectEntitlements, entitlements =>
  !isTestnet() ? entitlements && entitlements.includes('funds_transfer') : false
);

export const selectCanTrade = createSelector(selectEntitlements, entitlements =>
  isProd() ? entitlements && entitlements.includes('funds_transfer') : true
);

export const selectDepositBonusEligible = createSelector(
  selectAffiliate,
  affiliateObj => false
  // TODO(AustinC): disabled; no deposit bonus for now
  // affiliateObj => !!affiliateObj && !!affiliateObj.eligibleForDepositMatch
);

export const selectAcceptedEmxTokenTerms = createSelector(selectAffiliate, affiliateObj =>
  !!affiliateObj ? !!affiliateObj.acdxTokenTermsAcceptedAt : false
);

export const selectIsSAFT = createSelector(
  selectAffiliate,
  affiliateObj => !!affiliateObj && affiliateObj.isSaftHolder
);

/**
 * SAGA HELPERS
 */

export function* fetchUserProfile() {
  const { idToken } = yield call([Auth, Auth.currentSession]);
  const user = yield call([Auth, Auth.currentAuthenticatedUser], { bypassCache: true });

  // getPreferredMFA must run after the currentSession since it is unable to refresh credentials and throws an error
  const [preferredMfa, userInfo] = yield all([
    call([Auth, Auth.getPreferredMFA], user),
    call([Auth, Auth.currentUserInfo]),
  ]);

  yield call([i18next, i18next.changeLanguage], userInfo.attributes.locale);

  return {
    userInfo,
    preferredMfa,
    identities: idToken.payload.identities,
    kycModel: JSON.parse(idToken.payload['custom:kyc_model']),
    entitlements: JSON.parse(idToken.payload['custom:entitlements']),
    missingRequiredFields: JSON.parse(idToken.payload['custom:missing_required_fields']),
    authTime: idToken.payload.auth_time * 1000,
  };
}

export function* fetchAffiliate() {
  const resp = yield call(api.getAffiliate);

  if (resp.ok) {
    yield put(fetchAffiliateAction.success(resp.data));
  }
}

export function* acceptTerms(sub, referralCode, user={}) {
  const { data: terms } = yield call(api.getTerms);

  yield call(api.acceptTerms, terms, sub, referralCode, user);
}

export function* fetchProfile() {
  const profile = yield call(fetchUserProfile);
  yield put(storeProfileAction(profile));

  setUserContext({
    id: profile.userInfo.attributes.sub,
  });

  setTags({
    locale: profile.userInfo.attributes.locale,
  });

  try {
    window.removeEventListener('storage', logoutOnStorageChange);
    window.addEventListener('storage', logoutOnStorageChange);
  } catch (err) {}
}

export function* refreshSession() {
  const currentSession = yield call([Auth, Auth.currentSession]);
  const { refreshToken } = currentSession;

  try {
    const user = yield call([Auth, Auth.currentAuthenticatedUser]);
    yield call([Auth, Auth.refreshSession], user, refreshToken);
  } catch (error) {
    yield put(logoutAction());
    handleAmplifyError(error);
  }
}

/**
 * SAGAS
 */
export function* silentRelogin() {
  const needLogout = yield checkAuthTime();
  if (!needLogout) {
    yield put(startApiCall({ apiCallId: apiCallIds.FETCH_USER_COGNITO_PROFILE }));
    yield call(relogin);
    yield put(finishApiCall({ apiCallId: apiCallIds.FETCH_USER_COGNITO_PROFILE }));
  }
}

export function* relogin() {
  try {
    yield call(fetchProfile);
    window.removeEventListener('storage', loginOnStorageChange);
    localStorage.setItem('login-event', `login-${Date.now()}`);
    yield put(loginActions.success());
  } catch (error) {
    yield put(loginActions.failure());
    if (error === 'No current user') {
      window.addEventListener('storage', loginOnStorageChange);
    }
  }
}

export function* refreshProfile() {
  try {
    yield call(refreshSession);
    yield call(fetchProfile);
  } catch (error) {
    handleAmplifyError(error);
  }
}

export function* logout({ payload: suppressRedirect }) {
  try {
    window.removeEventListener('storage', logoutOnStorageChange);
    clearCookies();
    localStorage.setItem('logout-event', `logout-${Date.now()}`);
  } catch (err) {}
  try {
    yield call([Auth, Auth.signOut]);
  } catch (error) {
    handleAmplifyError(error);
  }
  if (suppressRedirect) {
    return;
  }
  if (!window.location.pathname.match('logout')) {
    window.location.reload();
  } else {
    window.location.href = '/trader';
  }
}

export function* checkAuthTime() {
  try {
    const {
      idToken: {
        payload: { auth_time: authTime },
      },
    } = yield call([Auth, Auth.currentSession]);
    if (authTime && Date.now() - authTime * 1000 > MAX_SESSION_DURATION) {
      yield put(logoutAction());
      return true;
    }
  } catch (err) {}
  return false;
}

export function* acceptACDXTokenTerms() {
  const resp = yield call(api.acceptACDXTokenTerms);

  if (resp.ok) {
    yield put(updateACDXTokenTermsAction());

    const isSaftHolder = yield select(selectIsSAFT);
    if (isSaftHolder) {
      window.location.reload();
    }
  }
}

function* getMaxLeverage() {
  const traderId = yield select(selectTraderId);
  const resp = yield call(api.getMaxLeverage, traderId);

  if (resp.ok) {
    yield put(getMaxLeverageActions.success(resp.data.maxLeverage));
  }
}

function* setMaxLeverage({ payload: maxLeverage }) {
  const traderId = yield select(selectTraderId);
  const resp = yield call(api.setMaxLeverage, traderId, { maxLeverage });

  if (resp.ok) {
    yield put(setMaxLeverageActions.success(maxLeverage));
  }

}

function* receiveMessage({ payload }) {
  const { channel, type, data } = payload;

  if (channel === WS_CHANNELS.ACCOUNT) {
    if (type === WS_DATA_TYPES.SNAPSHOT) {
      yield put(initializeRewardsAction(data));
    } else if (type === WS_DATA_TYPES.UPDATE) {
      yield put(updateRewardsAction(data));
    }
  }
}

function* reloadPage() {
  yield persistor.flush();
  yield put(softReloadAppAction());
}

function* changeLocale({ payload }) {
  const { locale } = payload;

  try {
    const user = yield call([Auth, Auth.currentAuthenticatedUser]);
    yield call([Auth, Auth.updateUserAttributes], user, { locale });
  } catch (err) {}

  yield call([i18next, i18next.changeLanguage], locale);
  yield call(reloadPage);
}

export function* userSaga() {
  yield takeLatest(LOGOUT, logout);
  yield takeLatest(SILENT_RELOGIN, silentRelogin);
  yield takeLatest(RELOGIN, relogin);
  yield takeLatest(REFRESH_PROFILE, refreshProfile);
  yield takeLatest(createActionType(FETCH_AFFILIATE, REQUEST), fetchAffiliate);
  yield takeLatest(UPDATE_ACTIVITY_PERIOD_KEY, checkAuthTime);
  yield takeEvery(RECEIVE_MESSAGE, receiveMessage);
  yield takeLatest(ACCEPT_ACDX_TOKEN_TERMS, acceptACDXTokenTerms);
  yield takeLatest(SET_TRADER_ID, reloadPage);
  yield takeLatest(createActionType(GET_MAX_LEVERAGE, REQUEST), getMaxLeverage);
  yield takeLatest(createActionType(SET_MAX_LEVERAGE, REQUEST), setMaxLeverage);
  yield takeLatest(CHANGE_LOCALE, changeLocale);
}
