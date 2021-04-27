import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import { takeEvery, takeLatest, call, put, select } from 'redux-saga/effects';
import BigNumber from 'bignumber.js';

import {
  createReducer,
  createActionCreator,
  createApiActionCreators,
  createActionType,
  replaceInArray,
  REQUEST,
  SUCCESS,
} from '../../../../common/utils/reduxHelpers';
import { toQuantityString } from '../../../../common/utils/numberHelpers';
import { KYC_STATUS } from '../../../../common/enums';
import { selectKycStatus } from '../../../../common/services/user';
import { RECEIVE_MESSAGE } from '../../../../common/services/webSocket';
import {
  selectCollateralPrices,
  selectCollateralTokens,
  selectTokens,
  selectTokenDecimalPlaces,
} from '../../../trader/data-store/ducks';
import transformDataMessage from '../../../trader/data-store/transformDataMessage';
import { WS_CHANNELS, WS_DATA_TYPES } from '../../../trader/constants';
import { selectAccountSummaryData } from '../../../trader/features/account-summary/ducks'; // TODO uplift
import { selectBalancesTable } from '../../../trader/features/positions/components/BalancesTable/ducks'; // TODO uplift

import api from './api';
import { TRANSFER_STATUS, TRANSFER_TYPE } from './constants';

const transferSelector = transferId => transfer => transfer.transferId === transferId;

const DAILY_WITHDRAWAL_LIMIT_USD_KYC_PASSED = 1000000;
const DAILY_WITHDRAWAL_LIMIT_USD_KYC_NOT_PASSED = 50000;

/**
 * ACTION TYPES
 */
export const FETCH_DEPOSIT_ADDRESS = 'transfers/FETCH_DEPOSIT_ADDRESS';
export const FETCH_TRANSFERS = 'transfers/FETCH_TRANSFERS';
export const REQUEST_WITHDRAWAL = 'transfers/REQUEST_WITHDRAWAL';
export const UPDATE_TRANSFERS = 'transfers/UPDATE_TRANSFERS';
export const CANCEL_WITHDRAWAL = 'transfers/CANCEL_WITHDRAWAL';
export const INSERT_TRANSFER = 'transfers/INSERT_TRANSFER';
export const SET_TOKEN = 'transfers/SET_TOKEN';

export const GET_STAKING_INFO = 'transfers/GET_STAKING_INFO';
export const POST_STAKING = 'transfers/POST_STAKING';
export const DELETE_STAKING = 'transfers/DELETE_STAKING';

/**
 * ACTIONS
 */
export const fetchDepositAddressActions = createApiActionCreators(FETCH_DEPOSIT_ADDRESS);
export const fetchTransfersActions = createApiActionCreators(FETCH_TRANSFERS);
export const requestWithdrawalActions = createApiActionCreators(REQUEST_WITHDRAWAL);
export const updateTransfersAction = createActionCreator(UPDATE_TRANSFERS);
export const cancelWithdrawalAction = createApiActionCreators(CANCEL_WITHDRAWAL);
export const insertTransferAction = createActionCreator(INSERT_TRANSFER);
export const setTokenAction = createActionCreator(SET_TOKEN);

export const getStakingInfoActions = createApiActionCreators(GET_STAKING_INFO);
export const postStakingActions = createApiActionCreators(POST_STAKING);
export const deleteStakingActions = createApiActionCreators(DELETE_STAKING);

const normalizeTransfer = transfer => ({
  ...transfer,
  type:
    transfer.type ||
    (BigNumber(transfer.amount || transfer.delta).isPositive()
      ? TRANSFER_TYPE.DEPOSIT
      : TRANSFER_TYPE.WITHDRAWAL),
  amount: BigNumber(transfer.amount || transfer.delta)
    .abs()
    .toNumber(),
});

/**
 * REDUCERS
 */
const initialState = {
  depositAddresses: {},
  transfers: [],
  token: 'BTC',
  staking: {},
};

const depositAddresses = createReducer(initialState.depositAddresses, {
  [FETCH_DEPOSIT_ADDRESS]: {
    [SUCCESS]: (state, { token, address }) => ({ ...state, [token]: address }),
  },
});

const transfers = createReducer(initialState.transfers, {
  [FETCH_TRANSFERS]: {
    [SUCCESS]: (_, transfers) =>
      transfers
        .map(normalizeTransfer)
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
  },
  [INSERT_TRANSFER]: (state, transfer) => [normalizeTransfer(transfer), ...state],
  [UPDATE_TRANSFERS]: (state, transfer) =>
    replaceInArray(state, transferSelector(transfer.transferId), normalizeTransfer(transfer)),
});

const token = createReducer(initialState.token, {
  [SET_TOKEN]: (_, token) => token,
});

const staking = createReducer(initialState.staking, {
  [GET_STAKING_INFO]: {
    [SUCCESS]: (_, data) => data,
  },
});

export default combineReducers({
  depositAddresses,
  transfers,
  token,
  staking,
});

/**
 * SELECTORS
 */
export const selectTransferData = state => state.transfers;

export const selectTransfers = state => selectTransferData(state).transfers;
export const selectDepositAddresses = state => selectTransferData(state).depositAddresses;
export const selectToken = state => selectTransferData(state).token;

export const selectStakingInfo = state => selectTransferData(state).staking;

export const selectFilteredTransfers = createSelector(
  selectTransfers,
  selectToken,
  selectTokenDecimalPlaces,
  (transfers, token, tokenDecimals) =>
    transfers
      .filter(({ tokenCode }) => tokenCode === token)
      .map(item => ({ ...item, decimalPlaces: tokenDecimals[item.tokenCode] || 8 }))
);

export const selectWithdrawals = createSelector(selectTransfers, transfers =>
  transfers.filter(({ type }) => type === TRANSFER_TYPE.WITHDRAWAL)
);

export const selectPendingWithdrawals = createSelector(selectTransfers, transfers =>
  transfers.filter(
    ({ status, type }) => type === TRANSFER_TYPE.WITHDRAWAL && status === TRANSFER_STATUS.PENDING
  )
);

export const select24hrSuccessfulWithdrawals = createSelector(selectTransfers, transfers =>
  transfers.filter(
    ({ status, type, createdAt }) => type === TRANSFER_TYPE.WITHDRAWAL 
      && status !== TRANSFER_STATUS.CANCELED && status !== TRANSFER_STATUS.REJECTED// && createdAt > Date().setDate(Date().getDate()-1)
  )
);

export const maxTransfer = (token, tokens, tokenBalances, { balances }, collateralPrices, collateralTokens) => {
  const tokenInfo = tokens.find(({ tokenCode }) => token === tokenCode);

  if (!tokenInfo)
    return 0;

  const balanceToken = tokenInfo.parentToken || token;

  const { decimalPlaces, freeBalance } = tokenBalances.find(
    ({ tokenCode }) => tokenCode === balanceToken
  ) || {
    decimalPlaces: 8,
    freeBalance: 0,
  };
  const isCollateral = !!collateralTokens.find(({ tokenCode }) => balanceToken === tokenCode);

  const price = collateralPrices[balanceToken];

  if (
    isCollateral &&
    BigNumber(balances.buyingPowerWithoutHaircut).isFinite() &&
    !!price &&
    BigNumber(price).isFinite()
  ) {
    const limitFromFunds = BigNumber(balances.buyingPowerWithoutHaircut).dividedBy(price);
    return BigNumber.max(0, BigNumber.min(freeBalance, limitFromFunds))
      .dp(decimalPlaces)
      .toNumber();
  }

  return BigNumber.max(0, BigNumber.min(freeBalance))
      .dp(decimalPlaces)
      .toNumber();;
}

export const selectMaxTransfer = createSelector(
  selectToken,
  selectTokens,
  selectBalancesTable,
  selectAccountSummaryData,
  selectCollateralPrices,
  selectCollateralTokens,
  (token, tokens, tokenBalances, { balances }, collateralPrices, collateralTokens) => {
    return maxTransfer(token, tokens, tokenBalances, { balances }, collateralPrices, collateralTokens);
  }
);

export const selectMaxWithdrawal = createSelector(
  selectToken,
  selectTokens,
  selectBalancesTable,
  selectAccountSummaryData,
  selectCollateralPrices,
  selectCollateralTokens,
  select24hrSuccessfulWithdrawals,
  selectKycStatus,
  (token, tokens, tokenBalances, { balances }, collateralPrices, collateralTokens, transfers, kycStatus) => {
    const maxTransferAmt = maxTransfer(token, tokens, tokenBalances, { balances }, collateralPrices, collateralTokens);

    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate()-1);

    const dailyTransfers = transfers.filter(
      ({ status, type, createdAt }) => createdAt > yesterday.toISOString() || typeof(createdAt)==='number');
      // type === TRANSFER_TYPE.WITHDRAWAL && status !== TRANSFER_STATUS.CANCELED && status !== TRANSFER_STATUS.REJECTED )

    let dailyTransfersUSD = dailyTransfers.map( t => t.amount * collateralPrices[t.tokenCode]);
    dailyTransfersUSD = dailyTransfersUSD.reduce((acc, usd) => acc + usd, 0);

    const tokenInfo = tokens.find(({ tokenCode }) => token === tokenCode);
    const balanceToken = tokenInfo.parentToken || token;
    const { decimalPlaces } = tokenBalances.find(
      ({ tokenCode }) => tokenCode === balanceToken
    ) || {
      decimalPlaces: 8
    };

    const price = collateralPrices[balanceToken];
    const limitFromDailyWithdrawalLimit = kycStatus === KYC_STATUS.PASSED
     ? BigNumber(DAILY_WITHDRAWAL_LIMIT_USD_KYC_PASSED - dailyTransfersUSD).dividedBy(price)
     : BigNumber(DAILY_WITHDRAWAL_LIMIT_USD_KYC_NOT_PASSED - dailyTransfersUSD).dividedBy(price);

    return BigNumber.max(0, BigNumber.min(maxTransferAmt, limitFromDailyWithdrawalLimit))
      .dp(decimalPlaces).toNumber();
    }
);

export const selectWithdrawalFee = createSelector(
  selectToken,
  selectTokens,
  (token, tokens) => {
    const tokenInfo = tokens.find(({ tokenCode }) => token === tokenCode);
    return tokenInfo.withdrawalFee;
  }
);

/**
 * SAGAS
 */
export function* fetchDepositAddress() {
  const token = yield select(selectToken);

  if (token === 'USD')
    return;

  const resp = yield call(api.getDepositAddress, token);

  if (resp && resp.ok) {
    const [depositAddress] = resp.data.depositAddresses.slice(-1);
    if (depositAddress) {
      yield put(
        fetchDepositAddressActions.success({ token, address: depositAddress.depositAddress })
      );
    }
  }
}

export function* fetchTransfers() {
  const resp = yield call(api.getTransfers);

  if (resp.ok) {
    const { transfers } = resp.data;

    yield put(fetchTransfersActions.success(transfers));
  }
}

export function* cancelWithdrawal({ payload: { transferId } }) {
  const transfers = yield select(selectWithdrawals);

  const transfer = transfers.find(transferSelector(transferId));

  yield put(updateTransfersAction({ ...transfer, status: TRANSFER_STATUS.CANCELLING }));

  const resp = yield call(api.cancelWithdrawal, transferId);

  if (!resp.ok) {
    yield put(updateTransfersAction({ ...transfer, status: TRANSFER_STATUS.PENDING }));
  } else {
    //  yield put(fetchTransfersActions.request());
  }
}

export function* requestWithdrawal({ payload: { amount, destinationAddress } }) {
  const tokenCode = yield select(selectToken);
  const tokenDecimals = yield select(selectTokenDecimalPlaces);

  yield call(api.requestWithdrawal, {
    amount: toQuantityString(amount, tokenDecimals[tokenCode] || 8),
    destinationAddress,
    tokenCode,
  });
  /*
  if (resp.ok) {
    yield put(fetchTransfersActions.request());
  }
  */
}

export function* getStakingInfo() {
  const resp = yield call(api.getStakingInfo);

  if (resp.ok) {
    yield put(getStakingInfoActions.success(resp.data));
  }
}

export function* postStaking({ payload: amount }) {
  const resp = yield call(api.postStaking, { amount: String(amount) });

  if (resp.ok) {
    yield getStakingInfo();
  }
}

export function* deleteStaking({ payload: amount }) {
  const resp = yield call(api.deleteStaking, { amount: String(amount) });

  if (resp.ok) {
    yield getStakingInfo();
  }
}

function* receiveMessage({ payload }) {
  const { channel, type, action, data = {} } = transformDataMessage(payload);

  if (channel === WS_CHANNELS.TRANSFERS && type === WS_DATA_TYPES.UPDATE) {
    const transfers = yield select(selectTransfers);
    const transfer = !!data.transferId && transfers.find(transferSelector(data.transferId));

    if (transfer) {
      yield put(updateTransfersAction({ ...transfer, ...data, status: action || data.status }));
    } else {
      yield put(
        insertTransferAction({
          ...data,
          createdAt: data.createdAt || Date.now(),
          status: action || data.status,
        })
      );
    }
  }
}

export function* transfersSaga() {
  yield takeLatest(createActionType(FETCH_DEPOSIT_ADDRESS, REQUEST), fetchDepositAddress);
  yield takeLatest(createActionType(FETCH_TRANSFERS, REQUEST), fetchTransfers);
  yield takeLatest(createActionType(REQUEST_WITHDRAWAL, REQUEST), requestWithdrawal);
  yield takeLatest(createActionType(CANCEL_WITHDRAWAL, REQUEST), cancelWithdrawal);
  yield takeLatest(createActionType(GET_STAKING_INFO, REQUEST), getStakingInfo);
  yield takeLatest(createActionType(POST_STAKING, REQUEST), postStaking);
  yield takeLatest(createActionType(DELETE_STAKING, REQUEST), deleteStaking);
  yield takeEvery(RECEIVE_MESSAGE, receiveMessage);
}
