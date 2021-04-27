import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import { takeLatest, call, put, select } from 'redux-saga/effects';
import BigNumber from 'bignumber.js';
import moment from 'moment';

import {
  createReducer,
  createActionCreator,
  createApiActionCreators,
  createActionType,
  REQUEST,
  SUCCESS,
} from '../../../../common/utils/reduxHelpers';
import { selectAccountTraderId } from '../../../../common/services/accounts';
import { SOFT_RELOAD_APP } from '../../../../common/services/webSocket';
import { selectTokenDecimalPlaces } from '../../../trader/data-store/ducks';

import api from './api';
import { TRANSACTION_LABEL, TRANSACTIONS } from './constants';

const normalizeLedger = (item, index) => ({
  ...item,
  rowKey: index,
  transactionId: item.transactionId !== null ? item.transactionId : '',
  transactionType:
    item.transactionType === TRANSACTIONS.XFER
      ? BigNumber(item.amount).isNegative()
        ? TRANSACTIONS.WITHDRAWAL
        : TRANSACTIONS.DEPOSIT
      : item.transactionType,
});

/**
 * ACTION TYPES
 */
export const FETCH_LEDGER = 'ledger/FETCH_LEDGER';
export const FETCH_LEDGER_SUMMARY = 'ledger/FETCH_LEDGER_SUMMARY';
export const FETCH_SUMMARY_AS_CSV = 'ledger/FETCH_SUMMARY_AS_CSV';
export const STORE_CSV_DATA = 'ledger/STORE_CSV_DATA';
export const TOGGLE_TRANSACTION_TYPE = 'ledger/TOGGLE_TRANSACTION_TYPE';
export const UPDATE_TOKEN_CODE = 'ledger/UPDATE_TOKEN_CODE';
export const UNLOAD_LEDGER = 'ledger/UNLOAD_LEDGER';

/**
 * ACTIONS
 */
export const fetchLedgerActions = createApiActionCreators(FETCH_LEDGER);
export const fetchLedgerSummaryActions = createApiActionCreators(FETCH_LEDGER_SUMMARY);
export const fetchSummaryAsCsvAction = createActionCreator(FETCH_SUMMARY_AS_CSV);
export const storeCsvDataAction = createActionCreator(STORE_CSV_DATA);
export const toggleTransactionTypeAction = createActionCreator(TOGGLE_TRANSACTION_TYPE);
export const updateTokenCodeAction = createActionCreator(UPDATE_TOKEN_CODE);
export const unloadLedgerAction = createActionCreator(UNLOAD_LEDGER);

/**
 * REDUCERS
 */
const initialState = {
  csv: false,
  ledger: [],
  ledgerTransactions: [],
  ledgerSummary: [],
  loaded: false,
  tokenCode: 'USD',
  ledgerTokenCodes: ['USD'],
};

const csv = createReducer(initialState.csv, {
  [STORE_CSV_DATA]: (_, csvData) =>
    csvData.split('\n').reduce((rows, row) => [...rows, row.split(',')], []),
});

const ledger = createReducer(initialState.ledger, {
  [FETCH_LEDGER]: {
    [SUCCESS]: (_, { ledger }) =>
      ledger.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
  },
  [UNLOAD_LEDGER]: _ => [],
});

const ledgerTransactions = createReducer(initialState.ledgerTransactions, {
  [FETCH_LEDGER]: {
    [SUCCESS]: (_, { ledger }) => {
      const map = {};
      ledger.map(normalizeLedger).forEach(({ transactionType }) => {
        if (!map[transactionType]) {
          map[transactionType] =
            TRANSACTION_LABEL[transactionType] || TRANSACTION_LABEL[TRANSACTIONS.OTHER];
        }
      });
      return Object.entries(map).map(([value, label]) => ({ label, value, selected: true }));
    },
  },
  [TOGGLE_TRANSACTION_TYPE]: (state, { target: { value } }) => {
    return state.reduce(
      (arr, item) => [...arr, item.value === value ? { ...item, selected: !item.selected } : item],
      []
    );
  },
  [UNLOAD_LEDGER]: _ => [],
});

const ledgerSummary = createReducer(initialState.ledgerSummary, {
  [FETCH_LEDGER_SUMMARY]: {
    [SUCCESS]: (_, { summary }) =>
      summary
        .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
        .reduce(
          (arr, item) => [
            ...arr,
            { ...item.amounts, date: item.date, eodBalance: item.eodBalance },
          ],
          []
        ),
  },
  [UNLOAD_LEDGER]: _ => [],
});

const loaded = createReducer(initialState.loaded, {
  [FETCH_LEDGER]: {
    [SUCCESS]: (_, data) => true,
  },
  [UNLOAD_LEDGER]: _ => false,
});

const tokenCode = createReducer(initialState.tokenCode, {
  [UPDATE_TOKEN_CODE]: (_, tokenCode) => tokenCode,
});

const ledgerTokenCodes = createReducer(initialState.ledgerTokenCodes, {
  [FETCH_LEDGER]: {
    [SUCCESS]: (_, { ledger }) => [...new Set(ledger.map(({ tokenCode }) => tokenCode))],
  },
});

export default combineReducers({
  csv,
  ledger,
  ledgerTransactions,
  ledgerSummary,
  loaded,
  tokenCode,
  ledgerTokenCodes,
});

/**
 * SELECTORS
 */

const selectTraderDataStore = state => state.traderDataStore;
const selectTokenBalances = state => selectTraderDataStore(state).tokenBalances.byId;

export const selectHistoryData = state => state.history;

export const selectLedgerData = state => selectHistoryData(state).ledger;
export const selectLedgerTransactionsData = state => selectHistoryData(state).ledgerTransactions;
export const selectLedgerSummaryData = state => selectHistoryData(state).ledgerSummary;
export const selectLedgerLoaded = state => selectHistoryData(state).loaded;
export const selectLedgerCsvData = state => selectHistoryData(state).csv;
export const selectLedgerTokenCode = state => selectHistoryData(state).tokenCode;
export const selectLedgerTokenCodes = state => selectHistoryData(state).ledgerTokenCodes;

export const selectLedger = createSelector(
  selectLedgerData,
  selectTokenBalances,
  selectLedgerTransactionsData,
  selectLedgerTokenCode,
  selectTokenDecimalPlaces,
  (ledger, tokenBalances, transactionTypes, ledgerTokenCode, tokenDecimals) => {
    const applicableTypes = transactionTypes.reduce(
      (map, { label, value, selected }) => (selected ? { ...map, [value]: true } : map),
      {}
    );
    const startBalance =
      tokenBalances.btc && tokenBalances[ledgerTokenCode.toLowerCase()]
        ? tokenBalances[ledgerTokenCode.toLowerCase()]
        : 0;
    let balance = BigNumber(startBalance);

    return ledger
      .filter(({ tokenCode }) => tokenCode === ledgerTokenCode)
      .map(normalizeLedger)
      .map((item, index) => {
        const row = {
          ...item,
          balance: balance.toNumber(),
          decimalPlaces: tokenDecimals[item.tokenCode] || 8,
        };
        balance = balance.minus(item.amount);
        return row;
      })
      .filter(({ transactionType }) => !!applicableTypes[transactionType]);
  }
);

export const selectAffiliateLastDay = createSelector(
  selectLedger,
  selectLedgerLoaded,
  (ledger, loaded) =>
    loaded &&
    ledger
      .reduce(
        (sum, { amount, createdAt, tokenCode, transactionType } = {}) =>
          transactionType === TRANSACTIONS.AFFIL &&
          tokenCode === 'USD' &&
          moment()
            .add(-1, 'days')
            .isBefore(createdAt)
            ? sum.plus(amount)
            : sum,
        BigNumber(0)
      )
      .toNumber()
);

export const selectLedgerSums = createSelector(selectLedgerSummaryData, summary => {
  const sums = {};
  let total = BigNumber(0);
  summary.forEach(({ eodBalance, date, ...item }) => {
    Object.entries(item).forEach(([key, val]) => {
      if (!sums[key]) {
        sums[key] = BigNumber(0);
      }
      sums[key] = sums[key].plus(val);
    });
  });
  for (let k in sums) {
    total = total.plus(sums[k]);
    sums[k] = sums[k].toString();
  }
  sums.rowKey = Date.now();
  sums.total = total.toString();
  return [sums];
});

/**
 * SAGAS
 */
export function* fetchLedger() {
  const accountId = yield select(selectAccountTraderId);

  const resp = yield call(api.getLedger, accountId);

  if (resp.ok) {
    const { transactions } = resp.data;

    yield put(fetchLedgerActions.success({ ledger: transactions }));
  }
}

export function* fetchLedgerSummary() {
  const accountId = yield select(selectAccountTraderId);

  const resp = yield call(api.getLedgerSummary, accountId);

  if (resp.ok) {
    const { summary } = resp.data;

    yield put(fetchLedgerSummaryActions.success({ summary }));
  }
}

export function* fetchAsCsv() {
  const accountId = yield select(selectAccountTraderId);

  const resp = yield call(api.getLedgerSummary, accountId, true);

  if (resp.ok) {
    yield put(storeCsvDataAction(resp.data));
  }
}

export function* unloadHistory() {
  yield put(unloadLedgerAction());
}

export function* historySaga() {
  yield takeLatest(createActionType(FETCH_LEDGER, REQUEST), fetchLedger);
  yield takeLatest(createActionType(FETCH_LEDGER_SUMMARY, REQUEST), fetchLedgerSummary);
  yield takeLatest(FETCH_SUMMARY_AS_CSV, fetchAsCsv);
  yield takeLatest(SOFT_RELOAD_APP, unloadHistory);
}
