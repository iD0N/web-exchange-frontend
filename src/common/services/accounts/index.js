// TODO: move to other dir as this is an app service, not a common service
import { createSelector } from 'reselect';
import { all, call, put, select, takeLatest } from 'redux-saga/effects';

import { withApiCall } from '../spinner';

import {
  createActionType,
  createApiActionCreators,
  createReducer,
  REQUEST,
  SUCCESS,
} from '../../utils/reduxHelpers';
import { selectHasAppAccess, setTraderIdAction } from '../user';

import api, { apiCallIds } from './api';

/**
 * ACTION TYPES
 */
export const FETCH_ACCOUNTS = 'accounts/FETCH_ACCOUNTS';
export const CREATE_ACCOUNT = 'accounts/CREATE_ACCOUNT';
export const DELETE_ACCOUNT = 'accounts/DELETE_ACCOUNT';
export const INTERNAL_TRANSFER = 'accounts/INTERNAL_TRANSFER';
export const REBALANCE_USD = 'accounts/REBALANCE_USD';

/**
 * ACTIONS
 */
export const fetchAccountsAction = createApiActionCreators(FETCH_ACCOUNTS);
export const createAccountAction = createApiActionCreators(CREATE_ACCOUNT);
export const deleteAccountAction = createApiActionCreators(DELETE_ACCOUNT);
export const internalTransferAction = createApiActionCreators(INTERNAL_TRANSFER);
export const rebalanceUsdAction = createApiActionCreators(REBALANCE_USD);

/**
 * REDUCERS
 */
const initialState = {
  accounts: [],
};

const accounts = createReducer(initialState.accounts, {
  [FETCH_ACCOUNTS]: {
    [SUCCESS]: (state, accounts) => accounts,
  },
});

export default accounts;

/**
 * SELECTORS
 */

export const selectAccountsData = state => state.accounts;

export const selectUser = state => state.user;
export const selectTraderId = state => selectUser(state).traderId || (state.accounts[0] || {}).traderId;

export const selectAccounts = createSelector(
  selectAccountsData,
  selectTraderId,
  (accounts, currentId) =>
    accounts.map((account, index) => ({
      ...account,
      isSelectedTraderId: currentId ? account.traderId === currentId : index === 0,
      isPrimary: index === 0,
      displayName: `${index === 0 ? 'Main Account' : (account.alias || account.anonymousName)}`,
    }))
);

export const selectFirstAccount = createSelector(selectAccounts, accounts => accounts[0] || {});

export const selectAccountTraderId = createSelector(
  selectAccounts,
  selectTraderId,
  selectFirstAccount,
  (accounts, traderId, { traderId: defaultTraderId }) =>
    !!traderId && accounts.length > 0 ? traderId : defaultTraderId
);

export const selectAccount = createSelector(
  selectAccounts,
  selectAccountTraderId,
  (accounts, traderId) =>
    accounts.find(({ traderId: accountTraderId }) => accountTraderId === traderId) || {}
);

export const selectAccountAlias = createSelector(
  selectAccount,
  ({ alias, anonymousName, isPrimary }) => alias || (isPrimary ? undefined : anonymousName)
);

export const selectTokenBalances = state => selectAccount(state).tokenBalances.byId;
export const selectAffiliateIncome = createSelector(
  selectAccount,
  ({ usdBalanceByType }) => (!!usdBalanceByType && usdBalanceByType.affiliateIncome) || 0
);

export const selectAccountsLoaded = createSelector(selectAccounts, accounts => accounts.length > 0);

/**
 * SAGA HELPERS
 */
export function* updateAccountAlias(alias) {
  const traderId = yield select(selectAccountTraderId);

  yield call(api.updateAccountAlias, traderId, alias);
  yield call(fetchAccountsWithBalanceData);
}

/**
 * SAGAS
 */
function* fetchAccountsWithBalanceData() {
  const hasAppAccess = yield select(selectHasAppAccess);

  if (!hasAppAccess) {
    return;
  }

  const accountsResp = yield call(api.getAccounts);

  if (accountsResp && accountsResp.ok) {
    const { accounts } = accountsResp.data;

    try {
      const subaccountsData = yield all(
        accounts.map(({ traderId }) => call(api.getAccountData, traderId))
      );
      const idToData = subaccountsData.reduce(
        (map, data, index) => (data.ok ? { ...map, [accounts[index].traderId]: data.data } : map),
        {}
      );

      const result = accounts.map(account => ({
        ...account,
        ...(idToData[account.traderId] || {}),
      }));

      yield put(fetchAccountsAction.success(result));
    } catch (err) {
      yield put(fetchAccountsAction.success(accounts));
    }
  }
}

function* createAccount({ payload }) {
  const resp = yield call(api.createAccount, payload);

  if (resp.ok) {
    yield put(fetchAccountsAction.request());
  }
}

function* deleteAccount({ payload: traderId }) {
  const resp = yield call(api.deleteAccount, traderId);
  const currentId = yield select(selectTraderId);

  if (resp.ok) {
    if (currentId === traderId) {
      // deleted the active subaccount, toggle back to default
      yield put(setTraderIdAction(null));
      return;
    }
    yield put(fetchAccountsAction.request());
  }
}

function* internalTransfer({ payload }) {
  const resp = yield call(api.internalTransfer, payload);

  if (resp.ok) {
    yield put(fetchAccountsAction.request());
  }
}

function* rebalanceUsd() {
  const currentId = yield select(selectTraderId);
  yield call(api.rebalanceUsd, currentId);
}

export function* accountsSaga() {
  yield takeLatest(
    createActionType(FETCH_ACCOUNTS, REQUEST),
    withApiCall(apiCallIds.FETCH_ACCOUNTS, fetchAccountsWithBalanceData)
  );
  yield takeLatest(createActionType(CREATE_ACCOUNT, REQUEST), createAccount);
  yield takeLatest(createActionType(DELETE_ACCOUNT, REQUEST), deleteAccount);
  yield takeLatest(createActionType(INTERNAL_TRANSFER, REQUEST), internalTransfer);
  yield takeLatest(createActionType(REBALANCE_USD, REQUEST), rebalanceUsd);
}
