import { combineReducers } from 'redux';
import { takeLatest, call, put, select } from 'redux-saga/effects';
import { createSelector } from 'reselect';
import { push } from 'react-router-redux';
import moment from 'moment';
import BigNumber from 'bignumber.js';

import {
  createReducer,
  createActionCreator,
  createApiActionCreators,
  createActionType,
  REQUEST,
  SUCCESS,
} from '../../../../common/utils/reduxHelpers';
import { toCamelCase } from '../../../../common/utils/apiHelpers';
import AlertService from '../../../../common/services/alert';
import { t } from '../../../../common/services/i18n';
import { SOFT_RELOAD_APP } from '../../../../common/services/webSocket';
import { selectAccountTraderId, updateAccountAlias } from '../../../../common/services/accounts';
import { REFRESH_PROFILE } from '../../../../common/services/user';

import api from './api';

/**
 * ACTION TYPES
 */

export const CLEAR_COMPETITION = 'competition/CLEAR_COMPETITION';
export const FETCH_COMPETITION = 'competition/FETCH_COMPETITION';
export const FETCH_COMPETITIONS = 'settings/FETCH_COMPETITIONS';
export const JOIN_COMPETITION = 'settings/JOIN_COMPETITION';
export const JOIN_COMPETITION_IF_ABLE = 'settings/JOIN_COMPETITION_IF_ABLE';
export const CREATE_COMPETITION = 'settings/CREATE_COMPETITION';
export const UPDATE_LEADERBOARD_NAME = 'settings/UPDATE_LEADERBOARD_NAME';
export const SET_CREATED_COMPETITION = 'settings/SET_CREATED_COMPETITION';
export const FETCH_COMPETITION_REFERRAL_CODE = 'competition/FETCH_COMPETITION_REFERRAL_CODE';
export const RESET_DATA = 'competition/RESET_DATA';

/**
 * ACTIONS
 */
export const clearCompetitionAction = createActionCreator(CLEAR_COMPETITION);
export const fetchCompetitionActions = createApiActionCreators(FETCH_COMPETITION);
export const fetchCompetitionsActions = createApiActionCreators(FETCH_COMPETITIONS);
export const joinCompetitionActions = createApiActionCreators(JOIN_COMPETITION);
export const joinCompetitionIfAbleActions = createActionCreator(JOIN_COMPETITION_IF_ABLE);
export const createCompetitionActions = createApiActionCreators(CREATE_COMPETITION);
export const updateLeaderboardNameAction = createActionCreator(UPDATE_LEADERBOARD_NAME);
export const setCreatedCompetitionAction = createActionCreator(SET_CREATED_COMPETITION);
export const fetchCompetitionReferralCodeActions = createApiActionCreators(
  FETCH_COMPETITION_REFERRAL_CODE
);
export const resetDataAction = createActionCreator(RESET_DATA);

const sortByPercentChange = (a, b) => {
  const exception = '0';
  const aIsException = a.percentChange === exception ? 1 : 0;
  const bIsException = b.percentChange === exception ? 1 : 0;

  if (!aIsException && !bIsException) {
    return Number(b.percentChange) - Number(a.percentChange);
  }
  return aIsException - bIsException;
};
const sortUnsorted = ({ isCurrentUser, a }) => (isCurrentUser ? -1 : a);

/**
 * REDUCERS
 */
const initialState = {
  competitions: [],
  competition: {},
  createdCompetition: false,
  referralCode: null,
  listLoaded: false,
};

const competitions = createReducer(initialState.competitions, {
  [FETCH_COMPETITIONS]: {
    [SUCCESS]: (_, competitions) =>
      competitions
        .reduce(
          (arrAndDict, item) =>
            !arrAndDict.dict[item.competitionId]
              ? {
                  arr: [...arrAndDict.arr, item],
                  dict: { ...arrAndDict.dict, [item.competitionId]: true },
                }
              : arrAndDict,
          { arr: [], dict: {} }
        )
        .arr.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
  },
  [RESET_DATA]: _ => [],
});

const competition = createReducer(initialState.competition, {
  [CLEAR_COMPETITION]: _ => false,
  [FETCH_COMPETITION]: {
    [SUCCESS]: (_, { competition: { leaderboard, ...competitionData }, chartData }) => {
      if (!competitionData) {
        return _;
      }

      const { startDate, endDate } = competitionData;

      const isUpcoming = moment().isBefore(startDate);
      const isExpired = moment().isAfter(endDate);
      const isActive = !isUpcoming && !isExpired;

      let rankCursor = 0;

      let traders = leaderboard
        .map(({ alias, ...item }, index) => ({
          ...item,
          alias,
          rank: index + 1,
          sortAlias: alias || '0',
          hasStarted: !isUpcoming,
          rektPercent:
            !BigNumber(item.rektPercent).isFinite() || BigNumber(item.rektPercent).isNegative()
              ? BigNumber(item.tradeVolume).isZero()
                ? -2
                : -1
              : BigNumber(item.rektPercent).toNumber(),
          inactiveTrader:
            BigNumber(item.tradeCount).isZero() && BigNumber(item.percentChange).isZero(),
        }))
        .map(item => ({
          ...item,
          tradeCount: item.tradeCount === '0' && item.percentChange !== '0' ? '1' : item.tradeCount,
          percentChange:
            BigNumber(item.percentChange).isZero() && !item.inactiveTrader
              ? '0.0000001'
              : item.percentChange,
        }))
        .sort(isUpcoming ? sortUnsorted : sortByPercentChange)
        .map((item, index) => {
          if (item.isEligible) {
            rankCursor++;
          }
          return {
            ...item,
            index,
            preRank: isUpcoming ? 1 : index + 1,
            rank: item.isEligible ? rankCursor : 'N/A',
            percentChange: item.percentChange === '0.0000001' ? '0' : item.percentChange,
          };
        });

      if (isUpcoming) {
        traders = [
          ...traders.filter(({ alias, isCurrentUser }) => !!alias || isCurrentUser),
          ...traders.filter(({ alias, isCurrentUser }) => !alias && !isCurrentUser),
        ];
      }

      const currentUser = traders.find(({ isCurrentUser }) => !!isCurrentUser);
      const eligibleAnonymousNames = {};
      traders.forEach(({ isEligible, anonymousName }) => {
        eligibleAnonymousNames[anonymousName] = isEligible;
      });

      const { options = {} } = competitionData || {};
      const requirements = [];
      if (options['netDepositRequirement']) {
        requirements.push({
          label: t('competition.requirements.netDeposit', {
            defaultValue: 'Net Deposit Requirement',
          }),
          value: options['netDepositRequirement'],
          unit: 'BTC',
        });
      }
      if (options['volumeRequirement']) {
        requirements.push({
          label: t('competition.requirements.volume', { defaultValue: 'Volume Requirement' }),
          value: options['volumeRequirement'],
          unit: 'USD',
        });
      }

      return {
        ...competitionData,
        loaded: Date.now(),
        isUpcoming,
        isActive,
        isExpired,
        chartData,
        leaderboard: traders,
        hideIneligibleByDefault: isUpcoming ? false : currentUser ? currentUser.isEligible : true,
        eligibleAnonymousNames,
        requirements,
      };
    },
  },
  [RESET_DATA]: _ => ({}),
});

const createdCompetition = createReducer(initialState.createdCompetition, {
  [SET_CREATED_COMPETITION]: (_, { competition }) => competition,
  [RESET_DATA]: _ => false,
});

const referralCode = createReducer(initialState.referralCode, {
  [FETCH_COMPETITION_REFERRAL_CODE]: {
    [SUCCESS]: (_, code) => code,
  },
  [RESET_DATA]: _ => null,
});

const listLoaded = createReducer(initialState.listLoaded, {
  [FETCH_COMPETITIONS]: {
    [SUCCESS]: _ => true,
  },
  [RESET_DATA]: _ => false,
});

export default combineReducers({
  competitions,
  competition,
  createdCompetition,
  referralCode,
  listLoaded,
});

/**
 * SELECTORS
 */
export const selectCompetitionsData = state => state.competitions;

export const selectCompetition = state => selectCompetitionsData(state).competition;
export const selectCompetitions = state => selectCompetitionsData(state).competitions;
export const selectCreatedCompetition = state => selectCompetitionsData(state).createdCompetition;
export const selectCompetitionReferralCode = state => selectCompetitionsData(state).referralCode;
export const selectCompetitionsListLoaded = state => selectCompetitionsData(state).listLoaded;

export const selectUpcomingCompetitions = createSelector(selectCompetitions, competitions =>
  competitions
    .filter(({ startDate }) => moment().isBefore(startDate))
    .map(item => ({ ...item, expired: false, active: false, upcoming: true }))
    .sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate))
);

export const selectActiveCompetitions = createSelector(selectCompetitions, competitions =>
  competitions
    .filter(({ startDate, endDate }) => moment().isAfter(startDate) && moment().isBefore(endDate))
    .map(item => ({ ...item, expired: false, active: true, upcoming: false }))
    .sort((a, b) => Date.parse(b.endDate) - Date.parse(a.endDate))
);

export const selectExpiredCompetitions = createSelector(selectCompetitions, competitions =>
  competitions
    .filter(({ endDate }) => moment().isAfter(endDate))
    .map(item => ({ ...item, expired: true, active: false, upcoming: false }))
    .sort((a, b) => Date.parse(b.endDate) - Date.parse(a.endDate))
);

export const selectIsCreator = createSelector(
  selectCompetition,
  selectUpcomingCompetitions,
  selectActiveCompetitions,
  selectAccountTraderId,
  (competition, upcoming, active, traderId) => {
    if (!competition) {
      return false;
    }
    const inList = [...upcoming, ...active].find(
      ({ competitionId }) => competitionId === competition.competitionId
    );
    return inList ? inList.createdBy === traderId : false;
  }
);

export const selectCompetitionCode = createSelector(
  selectCompetition,
  selectUpcomingCompetitions,
  selectActiveCompetitions,
  (competition, upcoming, active) => {
    if (!competition) {
      return false;
    }
    const inList = [...upcoming, ...active].find(
      ({ competitionId }) => competitionId === competition.competitionId
    );
    return inList ? inList.code : false;
  }
);

/**
 * SAGAS
 */
export function* fetchAndSelectCompetitionOrRedirect(competitionId) {
  yield fetchCompetition({ payload: { competitionId } });
  const competition = yield select(selectCompetition);
  if (!competition || !competition.competitionId) {
    yield put(push('/trader/'));
    return;
  }

  return competition;
}

export function* fetchCompetition({ payload: { competitionId, contractCode } }) {
  const resp = yield call(api.getCompetition, competitionId, contractCode);

  if (resp.ok) {
    const { competition, chart_data } = resp.data;

    yield put(
      fetchCompetitionActions.success({
        competition: toCamelCase(competition),
        chartData: chart_data,
      })
    );
  } else {
    yield put(fetchCompetitionActions.success({}));
    AlertService.error('This competition does not exist.');
    yield put(push('/settings/competitions'));
  }
}

export function* fetchCompetitions() {
  const accountId = yield select(selectAccountTraderId);
  const resp = yield call(api.getCompetitions, accountId);

  if (resp.ok) {
    const { competitions = [] } = resp.data;

    yield put(fetchCompetitionsActions.success(competitions));
  }
}

export function* joinCompetitionIfAble({ payload: { code, competitionId } }) {
  const accountId = yield select(selectAccountTraderId);
  if (!accountId) {
    return;
  }

  // Ensure we have the data needed to check for code (if member already)
  const competition = yield select(selectCompetition);
  const competitions = yield select(selectCompetitions);
  if (!competition && competitionId) {
    yield fetchAndSelectCompetitionOrRedirect(competitionId);
  }
  if (!competitions.length) {
    yield fetchCompetitions();
  }

  const codeIfAlreadyJoined = yield select(selectCompetitionCode);
  const isInLeaderboard = competition.leaderboard
    ? competition.leaderboard.findIndex(({ isCurrentUser }) => isCurrentUser) !== -1
    : false;

  if (!codeIfAlreadyJoined || !isInLeaderboard) {
    yield joinCompetition({ payload: { code } });
  }
}

export function* joinCompetition({ payload: { code } }) {
  const accountId = yield select(selectAccountTraderId);
  let competition = yield select(selectCompetition);
  const competitions = yield select(selectCompetitions);
  const matchingCompetition = competitions.find(
    ({ code: competitionCode }) => code === competitionCode
  );

  if (matchingCompetition) {
    if (!competition || !competition.leaderboard) {
      competition = yield fetchAndSelectCompetitionOrRedirect(matchingCompetition.competitionId);
      if (!competition) {
        return;
      }
    }
    if (
      competition &&
      competition.competitionId === matchingCompetition.competitionId &&
      !competition.leaderboard.find(({ isCurrentUser }) => !!isCurrentUser)
    ) {
      // Is creator but has not joined yet, do not return
    } else {
      yield put(push(`/competition/${matchingCompetition.competitionId}`));
      return;
    }
  }

  const resp = yield call(api.joinCompetition, accountId, { code });

  if (resp.ok) {
    const {
      competition: { competitionId },
    } = toCamelCase(resp.data);
    yield put(push(`/competition/${competitionId}`));
    yield fetchCompetitions();
  } else {
    yield put(push('/settings/competitions'));
    AlertService.error('The competition code you entered is not valid.');
  }
}

export function* createCompetition({
  payload: { autoJoin, isPublic, label, startDate, endDate, slug, code },
}) {
  const accountId = yield select(selectAccountTraderId);

  if (!label) {
    AlertService.error('You must give your competition a name.');
    return;
  }

  const resp = yield call(api.createCompetition, accountId, {
    autoJoin,
    isPublic,
    label: label || undefined,
    slug: slug || undefined,
    startDate: moment(startDate).toISOString(),
    endDate: moment(endDate).toISOString(),
    code: code || undefined,
  });

  if (resp.ok && resp.status === 200) {
    const { competition } = toCamelCase(resp.data);
    yield put(setCreatedCompetitionAction({ competition }));
    yield fetchCompetitions();
  }
}

export function* updateLeaderboardName({ payload: name }) {
  yield call(updateAccountAlias, name);
  yield put({ type: REFRESH_PROFILE });
}

export function* fetchCompetitionReferralCode({ payload: competitionCode }) {
  const resp = yield call(api.getCreatedByReferralCode, competitionCode);

  if (resp.status === 200) {
    const { affiliateInfo } = resp.data;
    if (affiliateInfo.referralCode) {
      yield put(fetchCompetitionReferralCodeActions.success(affiliateInfo.referralCode));
      return;
    }
  }
  yield put(push('/compete'));
  return;
}

export function* unloadData() {
  yield put(resetDataAction());
}

export function* competitionsSaga() {
  yield takeLatest(createActionType(FETCH_COMPETITION, REQUEST), fetchCompetition);
  yield takeLatest(createActionType(FETCH_COMPETITIONS, REQUEST), fetchCompetitions);
  yield takeLatest(createActionType(JOIN_COMPETITION, REQUEST), joinCompetition);
  yield takeLatest(createActionType(CREATE_COMPETITION, REQUEST), createCompetition);
  yield takeLatest(UPDATE_LEADERBOARD_NAME, updateLeaderboardName);
  yield takeLatest(JOIN_COMPETITION_IF_ABLE, joinCompetitionIfAble);
  yield takeLatest(
    createActionType(FETCH_COMPETITION_REFERRAL_CODE, REQUEST),
    fetchCompetitionReferralCode
  );
  yield takeLatest(SOFT_RELOAD_APP, unloadData);
}
