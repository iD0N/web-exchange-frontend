import { combineReducers } from 'redux';
import { takeLatest, call, put } from 'redux-saga/effects';
import { createSelector } from 'reselect';

import {
  createReducer,
  createActionCreator,
  createApiActionCreators,
  createActionType,
  REQUEST,
  SUCCESS,
} from '../../common/utils/reduxHelpers';
import AlertService from '../../common/services/alert';
import { toCamelCase } from '../../common/utils/apiHelpers';
import { t } from '../../common/services/i18n';
import { selectCompetition } from '../settings/components/competitions/ducks';

import api from './api';

const defaultState = {
  plNotional: [],
  plNotionalPerContract: {},
  feesNet: [],
  loaded: false,
};

const appendRank = (item, index) => ({ ...item, rank: index + 1 });

export const NO_CONTRACT_VALUE = 'ALL';

/**
 * ACTION TYPES
 */

export const FETCH_LEADERBOARD = 'leaderboard/FETCH_LEADERBOARD';
export const CLEAR_LEADERBOARD = 'leaderboard/CLEAR_LEADERBOARD';

/**
 * ACTIONS
 */
export const fetchLeaderboardActions = createApiActionCreators(FETCH_LEADERBOARD);
export const clearLeaderboardActions = createActionCreator(CLEAR_LEADERBOARD);

/**
 * REDUCERS
 */
const initialState = {
  leaderboard: defaultState,
};

const leaderboard = createReducer(initialState.leaderboard, {
  [FETCH_LEADERBOARD]: {
    [SUCCESS]: (_, { leaderboard }) => ({
      plNotional: toCamelCase(leaderboard.pl_notional.map(appendRank)),
      plNotionalPerContract: Object.entries(leaderboard.pl_notional_per_contract).reduce(
        (map, [contractCode, rankings]) => ({
          ...map,
          [contractCode]: toCamelCase(rankings.map(appendRank)),
        }),
        {}
      ),
      feesNet: toCamelCase(leaderboard.fees_net.map(appendRank)),
    }),
  },
  [CLEAR_LEADERBOARD]: state => defaultState,
});

export default combineReducers({
  leaderboard,
});

/**
 * SELECTORS
 */

const selectTraderDataStore = state => state.traderDataStore || { contracts: [] };
export const selectActiveContracts = state =>
  (Object.values(selectTraderDataStore(state).contracts.byId) || []).sort((a, b) => {
    if (a.contractCode < b.contractCode) {
      return -1;
    }
    if (a.contractCode > b.contractCode) {
      return 1;
    }
    return 0;
  });
const selectActiveContractsMap = createSelector(selectActiveContracts, contracts =>
  contracts.reduce((map, { contractCode }) => ({ ...map, [contractCode]: true }), {})
);

export const selectLeaderboardData = state => state.leaderboard;
export const selectLeaderboard = state => selectLeaderboardData(state).leaderboard;

export const selectContracts = createSelector(
  selectLeaderboard,
  selectActiveContractsMap,
  ({ plNotionalPerContract }, activeContracts) => {
    const contractCodes = Object.keys(plNotionalPerContract);
    const activeCodes = [];
    let l = contractCodes.length;
    while (l--) {
      if (activeContracts[contractCodes[l]]) {
        activeCodes.unshift(contractCodes[l]);
        contractCodes.splice(l, 1);
      }
    }
    return [
      {
        value: NO_CONTRACT_VALUE,
        label: t('competition.leaderboard.allContracts', { defaultValue: 'All Contracts' }),
      },
      ...[...activeCodes, ...contractCodes].map(value => ({
        value: value,
        label: value.toUpperCase(),
      })),
    ];
  }
);

export const selectApplicableContracts = createSelector(
  selectActiveContracts,
  selectCompetition,
  (contracts, competition) => {
    const contractLeaderboards =
      competition &&
      competition.options &&
      competition.options.contractLeaderboards &&
      competition.options.contractLeaderboards.length > 0
        ? competition.options.contractLeaderboards
        : ['ALL'];
    const applicable = contractLeaderboards.reduce(
      (map, contractCode) => ({ ...map, [contractCode]: true }),
      {}
    );
    const applicableContracts = [...contracts];

    let l = contracts.length;
    while (l--) {
      if (!applicable[applicableContracts[l].contractCode]) {
        applicableContracts.splice(l, 1);
      }
    }
    return applicableContracts.reduce(
      (arr, { contractCode }) => [...arr, { label: contractCode, value: contractCode }],
      applicable[NO_CONTRACT_VALUE]
        ? [
            {
              value: NO_CONTRACT_VALUE,
              label: t('competition.leaderboard.allContracts', { defaultValue: 'All Contracts' }),
            },
          ]
        : []
    );
  }
);

/**
 * SAGAS
 */

export function* fetchLeaderboard({ payload: competitionId }) {
  const resp = yield call(api.getLeaderboard);

  if (resp.ok) {
    const leaderboard = resp.data;
    yield put(fetchLeaderboardActions.success({ leaderboard }));
  } else {
    AlertService.error('Could not load leaderboard.');
  }
}

export function* leaderboardSaga() {
  yield takeLatest(createActionType(FETCH_LEADERBOARD, REQUEST), fetchLeaderboard);
}
