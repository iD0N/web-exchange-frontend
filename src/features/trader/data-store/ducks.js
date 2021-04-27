import { combineReducers } from 'redux';
import { takeLatest, takeEvery, call, put, select } from 'redux-saga/effects';
import { LOCATION_CHANGE, push, replace } from 'react-router-redux';
import keyBy from 'lodash.keyby';
import map from 'lodash.map';
import pick from 'lodash.pick';
import BigNumber from 'bignumber.js';
import moment from 'moment';

import {
  createReducer,
  createActionCreator,
  createApiActionCreators,
  createActionType,
  REQUEST,
  SUCCESS,
  createMarkedSelector,
  fullThrottle,
} from '../../../common/utils/reduxHelpers';
import {
  RECEIVE_MESSAGE,
  SOFT_RELOAD_APP,
  UPDATE_ACTIVITY_PERIOD_KEY,
} from '../../../common/services/webSocket';
import { DIRECTION } from '../../../common/enums';
import { selectAccountsLoaded } from '../../../common/services/accounts';
import { selectIsLoggedIn } from '../../../common/services/user';
import { ORDER_SIZE_DECIMALS, PRICE_DECIMALS, WS_CHANNELS, WS_DATA_TYPES } from '../constants';

import api from './api';
import transformDataMessage from './transformDataMessage';
import { findContractBySeries, sortContractCodes } from './utils';

/**
 * ACTION TYPES
 */
/** WebSocket **/
export const BATCH_TICKER_DATA_UPDATE = 'traderDataStore/BATCH_TICKER_DATA_UPDATE';
export const STORE_TICKER_DATA_BATCH = 'traderDataStore/STORE_TICKER_DATA_BATCH';
export const STORE_BALANCE_DATA = 'traderDataStore/STORE_BALANCE_DATA';

export const INIT_COLLATERAL_PRICES = 'traderDataStore/INIT_COLLATERAL_PRICES';
export const UPDATE_COLLATERAL_PRICE = 'traderDataStore/UPDATE_COLLATERAL_PRICE';

/** Contract **/
export const FETCH_CONTRACTS = 'traderDataStore/FETCH_CONTRACTS';
export const SET_GLOBAL_CONTRACT = 'traderDataStore/SET_GLOBAL_CONTRACT';
export const OPEN_GLOBAL_CONTRACT = 'traderDataStore/OPEN_GLOBAL_CONTRACT';
export const STORE_FUNDING_DATA = 'traderDataStore/STORE_FUNDING_DATA';
export const STORE_CONTRACT_OUTAGE = 'traderDataStore/STORE_CONTRACT_OUTAGE';
export const FETCH_TOKENS = 'traderDataStore/FETCH_TOKENS';

/**
 * ACTIONS
 */
/** WebSocket **/
export const batchTickerDataUpdateAction = createActionCreator(BATCH_TICKER_DATA_UPDATE);
export const storeTickerDataBatchAction = createActionCreator(STORE_TICKER_DATA_BATCH);
export const storeTokenBalancesDataAction = createActionCreator(STORE_BALANCE_DATA);
export const initCollateralPricesAction = createActionCreator(INIT_COLLATERAL_PRICES);
export const updateCollateralPricesAction = createActionCreator(UPDATE_COLLATERAL_PRICE);

/** Contract **/
export const fetchContractsActions = createApiActionCreators(FETCH_CONTRACTS);
export const setGlobalContractAction = createActionCreator(SET_GLOBAL_CONTRACT);
export const openGlobalContractAction = createActionCreator(OPEN_GLOBAL_CONTRACT);
export const storeFundingDataAction = createActionCreator(STORE_FUNDING_DATA);
export const storeContractOutageAction = createActionCreator(STORE_CONTRACT_OUTAGE);
export const fetchTokensActions = createApiActionCreators(FETCH_TOKENS);

/**
 * REDUCERS
 */
const initialState = {
  /** WebSocket **/
  tickerData: {},
  tokenBalances: { byId: {}, loaded: false },
  collateralPrices: {},

  /** Contract **/
  contracts: { byId: {}, ids: [], loaded: false },
  fundingData: {},
  globalContractCode: null,
  contractOutage: {},
  tokens: [],
  tokensLoaded: false,
};

/** WebSocket **/
const tickerData = createReducer(initialState.tickerData, {
  [STORE_TICKER_DATA_BATCH]: (state, batch) => {
    return batch.reduce((acc, { contractCode, ...data }) => {
      const {
        lastTradePrice: prevLastTradePrice,
        fairPrice: prevFairPrice,
        markPrice: prevMarkPrice,
        lastTradePriceDirection: prevLastTradePriceDirection,
        fairPriceDirection: prevFairPriceDirection,
        markPriceDirection: prevMarkPriceDirection,
      } = state[contractCode] || {};
      return {
        ...acc,
        [contractCode]: {
          ...data,
          lastTradePriceDirection: BigNumber(data.lastTradePrice).isGreaterThan(prevLastTradePrice)
            ? DIRECTION.UP
            : BigNumber(data.lastTradePrice).isEqualTo(prevLastTradePrice)
            ? prevLastTradePriceDirection
            : DIRECTION.DOWN,
          fairPriceDirection: BigNumber(data.fairPrice).isGreaterThan(prevFairPrice)
            ? DIRECTION.UP
            : BigNumber(data.fairPrice).isEqualTo(prevFairPrice)
            ? prevFairPriceDirection
            : DIRECTION.DOWN,
          markPriceDirection: BigNumber(data.markPrice).isGreaterThan(prevMarkPrice)
            ? DIRECTION.UP
            : BigNumber(data.markPrice).isEqualTo(prevMarkPrice)
            ? prevMarkPriceDirection
            : DIRECTION.DOWN,
        },
      };
    }, state);
  },
});

const tokenBalances = createReducer(initialState.tokenBalances, {
  [STORE_BALANCE_DATA]: (state, payload) => ({ byId: payload, loaded: true }),
  [UPDATE_ACTIVITY_PERIOD_KEY]: ({ byId }) => ({ byId, loaded: false }),
});

const collateralPrices = createReducer(initialState.collateralPrices, {
  [INIT_COLLATERAL_PRICES]: (state, collateralPrices) =>
    collateralPrices.reduce(
      (map, { indexPrice, tokenCode }) => ({ ...map, [tokenCode]: indexPrice }),
      {}
    ),
  [UPDATE_COLLATERAL_PRICE]: (state, { indexPrice, tokenCode }) =>
    !state[tokenCode] || state[tokenCode] !== indexPrice
      ? {
          ...state,
          [tokenCode]: indexPrice,
        }
      : state,
});

const contractFields = [
  'contractCode',
  'seriesCode',
  'longName',
  'assetClass',
  'underlying',
  'quoteCurrency',
  'minimumPriceIncrement',
  'expiryName',
  'expiryTime',
  'listTime',
  'type',
  'multiplier',
  'indexCode',
  'priceBandThresholdMarket',
  'priceBandThresholdLimit',
  'maintenanceInitialRatio',
  'liquidationInitialRatio',
  'fundingInterval',
  'fundingRateIndexCode',
  'makerFee',
  'takerFee',
  'liquidationFee',
  'withdrawalFee',
  'initialMarginBase',
  'initialMarginPerContract',
  'positionLimit',
  'isExpired',
  'minimumQuantity',
  'quantityStep',
  'priceDecimals',
  'sizeDecimals',
  'spreadContractCodeBack',
  'spreadContractCodeFront',
  'seriesMarginMultiplier',
  'positionLimitAdjustment',
];

/** Contract **/
const contracts = createReducer(initialState.contracts, {
  [FETCH_CONTRACTS]: {
    [SUCCESS]: (state, { contracts }) => ({
      byId: keyBy(
        contracts
          .sort((a, b) => a.underlying.localeCompare(b.underlying))
          .map(c => pick(c, contractFields)),
        'contractCode'
      ),
      loaded: true,
      ids: map(sortContractCodes(contracts), 'contractCode'),
    }),
  },
});

const globalContractCode = createReducer(initialState.globalContractCode, {
  [SET_GLOBAL_CONTRACT]: (state, globalContractCode) => globalContractCode,
});

const fundingData = createReducer(initialState.fundingData, {
  [STORE_FUNDING_DATA]: (
    state,
    { contractCode, nextFundingRate, nextFundingTime, indicativeFundingRate, indicativeFundingTime }
  ) => ({
    ...state,
    [contractCode]: {
      nextFundingRate,
      nextFundingTime,
      indicativeFundingRate,
      indicativeFundingTime,
    },
  }),
});

const contractOutage = createReducer(initialState.contractOutage, {
  [STORE_CONTRACT_OUTAGE]: (state, { contract, outage }) => ({ ...state, [contract]: outage }),
});

const tokens = createReducer(initialState.tokens, {
  [FETCH_TOKENS]: {
    [SUCCESS]: (state, { tokens }) => tokens,
  },
});

const tokensLoaded = createReducer(initialState.tokensLoaded, {
  [FETCH_TOKENS]: {
    [SUCCESS]: _ => true,
  },
});

export default combineReducers({
  /** WebSocket **/
  tickerData,
  tokenBalances,
  collateralPrices,

  /** Contract **/
  contracts,
  globalContractCode,
  fundingData,
  contractOutage,
  tokens,
  tokensLoaded,
});

/**
 * SELECTORS
 */
export const selectTraderDataStore = state => state.traderDataStore;
const selectSummaryData = state => state.dashboard;

/** WebSocket **/
export const selectTickerData = state => selectTraderDataStore(state).tickerData;
export const selectTokenBalances = state => selectTraderDataStore(state).tokenBalances.byId;
export const selectTokenBalancesLoaded = state => selectTraderDataStore(state).tokenBalances.loaded;
export const selectCollateralPrices = state => selectTraderDataStore(state).collateralPrices;
export const selectFundingData = state => selectTraderDataStore(state).fundingData;
export const selectContractOutage = state => selectTraderDataStore(state).contractOutage;
export const selectTokens = state => selectTraderDataStore(state).tokens;
export const selectTokensLoaded = state => selectTraderDataStore(state).tokensLoaded;

/** Contract **/
export const selectContracts = state => selectTraderDataStore(state).contracts.byId;
export const selectContractsLoaded = state => selectTraderDataStore(state).contracts.loaded;
export const selectContractCodes = state => selectTraderDataStore(state).contracts.ids;
export const selectGlobalContractCode = state => selectTraderDataStore(state).globalContractCode;

export const selectSeriesSpecs = createMarkedSelector(
  'selectSeriesSpecs',
  selectContracts,
  (contracts) => {
    const series = {};

    Object.values(contracts).map(
      ({ seriesCode, indexCode, seriesMarginMultiplier, positionLimitAdjustment}) =>
      series[seriesCode] = { indexCode, seriesMarginMultiplier, positionLimitAdjustment } )

    return series;
  }
);

export const selectSeriesCodeFromContractCode = createMarkedSelector(
  'selectSeriesCodeFromContractCode',
  selectContracts,
  (contracts) => {
    const series = {};

    Object.values(contracts).map(
      ({ contractCode, seriesCode}) =>
      series[contractCode] = seriesCode )

    return series;
  }
);

export const selectContractByCode = createMarkedSelector(
  'selectContractByCode',
  selectContracts,
  (_, contractCode) => contractCode,
  (contracts, contractCode) => contracts[contractCode]
);

export const selectGlobalContract = createMarkedSelector(
  'selectGlobalContract',
  selectContracts,
  selectGlobalContractCode,
  (contracts, globalContractCode) => contracts[globalContractCode] || {}
);

export const selectGlobalContractTickSize = createMarkedSelector(
  'selectGlobalContractTickSize',
  selectContracts,
  selectGlobalContractCode,
  (contracts, globalContractCode) =>
    BigNumber(contracts[globalContractCode].minimumPriceIncrement).toNumber()
);

export const selectGlobalContractPriceDecimals = createMarkedSelector(
  'selectGlobalContractPriceDecimals',
  selectContracts,
  selectGlobalContractCode,
  (contracts, globalContractCode) => contracts[globalContractCode].priceDecimals || PRICE_DECIMALS
);

export const selectGlobalContractSizeDecimals = createMarkedSelector(
  'selectGlobalContractSizeDecimals',
  selectContracts,
  selectGlobalContractCode,
  (contracts, globalContractCode) =>
    contracts[globalContractCode].priceDecimals || ORDER_SIZE_DECIMALS
);

export const selectGlobalContractTickerData = createMarkedSelector(
  'selectGlobalContractTickerData',
  selectTickerData,
  selectGlobalContractCode,
  (tickerData, globalContractCode) => tickerData[globalContractCode] || {}
);

export const selectMarkPrice = createMarkedSelector(
  'selectMarkPrice',
  selectTickerData,
  (_, contractCode) => contractCode,
  (data, contractCode) => (data[contractCode] ? data[contractCode].markPrice : undefined)
);

export const selectDollarizer = createMarkedSelector(
  'selectDollarizer',
  selectTickerData,
  (_, contractCode) => contractCode,
  (data, contractCode) => (data[contractCode] ? data[contractCode].dollarizer : '1.00000000')
);

export const selectIsInOutage = createMarkedSelector(
  'selectIsInOutage',
  selectGlobalContractCode,
  selectContractOutage,
  (contractCode, outageMap) => {
    const outage = outageMap[contractCode];
    if (!outage) {
      return false;
    }

    if (outage.start) {
      if (moment().isAfter(outage.start) && moment().isBefore(outage.end)) {
        return true;
      }
    }
    return false;
  }
);

export const selectIsInEntryOnlyMode = createMarkedSelector(
  'selectIsInEntryOnlyMode',
  selectGlobalContractCode,
  selectContractOutage,
  (contractCode, outageMap = {}) => {
    const outage = outageMap[contractCode];
    if (!outage) {
      return false;
    }

    if (moment().isAfter(moment(outage.end).add(-10, 'minutes')) && moment().isBefore(outage.end)) {
      return outage.end;
    }
  }
);

export const selectGlobalContractFundingData = createMarkedSelector(
  'selectGlobalContractFundingData',
  selectGlobalContractCode,
  selectFundingData,
  (contractCode, data = {}) => (data[contractCode] ? data[contractCode] : {})
);

export const selectTransferableTokens = createMarkedSelector(
  'selectTransferableTokens',
  selectTokens,
  tokens =>
    tokens
      .filter(({ isTransferable }) => !!isTransferable)
      .sort((a, b) => a.tokenCode.localeCompare(b.tokenCode))
);

export const selectUSDStableTokens = createMarkedSelector(
  'selectTransferableTokens',
  selectTokens,
  tokens =>
    tokens
      .filter(({ parentToken }) => parentToken==='USD')
      .sort((a, b) => a.tokenCode.localeCompare(b.tokenCode))
);

export const selectParentTokensWithWithdrawableChildren = createMarkedSelector(
  'selectParentTokensWithWithdrawableChildren',
  selectTokens,
  tokens => [
    ...new Set(
      tokens.filter(({ parentToken }) => !!parentToken).map(({ parentToken }) => parentToken)
    ),
  ]
);

export const selectInternallyTransferableTokens = createMarkedSelector(
  'selectInternallyTransferableTokens',
  selectTokens,
  selectParentTokensWithWithdrawableChildren,
  (tokens, parentTokens) =>
    tokens
      .filter(
        ({ tokenCode, isTransferable, parentToken }) =>
          // allow internal transfers if the token is withdrawable and doesn't have a parent
          //   OR it is a parent of a withdrawable child
          (!!isTransferable && !parentToken) || parentTokens.includes(tokenCode)
      )
      .sort((a, b) => a.tokenCode.localeCompare(b.tokenCode))
);

export const selectVisibleTokens = createMarkedSelector(
  'selectVisibleTokens',
  selectTokens,
  tokens => tokens.filter(({ isVisible }) => !!isVisible)
);

export const selectCollateralTokens = createMarkedSelector(
  'selectCollateralTokens',
  selectTokens,
  tokens => tokens.filter(({ isCollateral }) => !!isCollateral)
);

export const selectTokenDecimalPlaces = createMarkedSelector(
  'selectTokenDecimalPlaces',
  selectVisibleTokens,
  tokens =>
    tokens.reduce((map, item) => ({ ...map, [item.tokenCode]: item.decimalPlaces || 8 }), {})
);

export const selectBtcContractCode = createMarkedSelector(
  'selectBtcContractCode',
  selectContracts,
  contractsById => {
    const contracts = Object.values(contractsById);
    return findContractBySeries(contracts, 'BTC');
  }
);

export const selectUS500ContractCode = createMarkedSelector(
  'selectUS500ContractCode',
  selectContracts,
  contractsById => {
    const contracts = Object.values(contractsById);
    return findContractBySeries(contracts, 'US500');
  }
);

export const selectBtcCollateralPrice = createMarkedSelector(
  'selectBtcCollateralPrice',
  selectCollateralPrices,
  pricesMap => pricesMap && pricesMap['BTC']
);

export const selectCollateralValue = createMarkedSelector(
  'selectCollateralValue',
  selectTokenBalances,
  selectCollateralTokens,
  selectCollateralPrices,
  (tokenBalances, collateralTokens, collateralPrices) =>
    collateralTokens
      .reduce(
        (sum, { tokenCode, collateralWeight }) =>
          tokenBalances[tokenCode.toLowerCase()]
            ? sum.plus(
                BigNumber(tokenBalances[tokenCode.toLowerCase()])
                .multipliedBy(BigNumber(collateralWeight))
                .multipliedBy(collateralPrices[tokenCode] || 0)
              )
            : sum,
        BigNumber(0)
      )
      .toNumber()
);

export const selectCollateralValueWithoutHaircut = createMarkedSelector(
  'selectCollateralValue',
  selectTokenBalances,
  selectCollateralTokens,
  selectCollateralPrices,
  (tokenBalances, collateralTokens, collateralPrices) =>
    collateralTokens
      .reduce(
        (sum, { tokenCode, collateralWeight }) =>
          tokenBalances[tokenCode.toLowerCase()]
            ? sum.plus(
                BigNumber(tokenBalances[tokenCode.toLowerCase()])
                .multipliedBy(collateralPrices[tokenCode] || 0)
              )
            : sum,
        BigNumber(0)
      )
      .toNumber()
);

export const selectHasFunds = createMarkedSelector(
  'selectHasFunds',
  selectTokenBalances,
  selectTokenBalancesLoaded,
  selectCollateralTokens,
  selectTokensLoaded,
  (tokenBalances, balanceDataLoaded, collateralTokens, tokensLoaded) => {
    if (!balanceDataLoaded || !tokensLoaded || collateralTokens.length === 0) {
      return true;
    }

    let hasFunds = false;
    collateralTokens.forEach(({ tokenCode }) => {
      if (
        tokenBalances[tokenCode.toLowerCase()] &&
        !BigNumber(tokenBalances[tokenCode.toLowerCase()]).isZero()
      ) {
        hasFunds = true;
      }
    });
    return hasFunds;
  }
);

export const selectContractDetails = createMarkedSelector(
  'selectContractDetails',
  selectGlobalContract,
  selectGlobalContractTickerData,
  selectGlobalContractFundingData,
  selectSummaryData,
  (
    { contractCode, expiryTime, longName, priceDecimals, sizeDecimals, spreadContractCodeBack, spreadContractCodeFront, quoteCurrency, underlying, type },
    { indexPrice, markPrice },
    { nextFundingTime, nextFundingRate },
    { summary }
  ) => {
    const contractSummary =
      summary && summary.find(({ contractCode: code }) => contractCode === code);

    return {
      contractCode,
      expiryTime,
      indexPrice,
      longName,
      markPrice,
      nextFundingTime,
      nextFundingRate,
      openInterest: contractSummary ? contractSummary.openInterest : undefined,
      priceDecimals,
      quoteCurrency,
      sizeDecimals,
      spreadContractCodeBack,
      spreadContractCodeFront,
      underlying,
      type,
      volume: contractSummary ? contractSummary.volume : undefined,
    };
  }
);

/**
 * SAGAS
 */
/** WebSocket **/
function* receiveMessage({ payload }) {
  const contracts = yield select(selectContracts);
  const contract =
    contracts && payload.data && payload.data.contractCode && contracts[payload.data.contractCode]
      ? contracts[payload.data.contractCode]
      : { priceDecimals: 2 };
  const { quoteCurrency } = contract;
  const { channel, data = {}, type } = transformDataMessage(payload, contract);

  if (channel === WS_CHANNELS.TICKER) {
    let usdPrice;
    let usdPriceActual;
    if (quoteCurrency === 'BTC') {
      const btcPrice = yield select(selectBtcCollateralPrice);
      usdPrice = BigNumber(data.lastTradePrice)
        .multipliedBy(btcPrice)
        .dp(2)
        .toNumber();
      usdPriceActual = BigNumber(data.lastTradePrice)
        .multipliedBy(btcPrice)
        .dp(2)
        .toNumber();
      if (!usdPrice) {
        usdPrice = BigNumber(data.lastTradePrice)
          .multipliedBy(btcPrice)
          .dp(4)
          .toNumber();
        usdPriceActual = BigNumber(data.lastTradePrice)
          .multipliedBy(btcPrice)
          .dp(4)
          .toNumber();
      }
    }
    yield put(batchTickerDataUpdateAction(usdPrice ? { ...data, usdPrice, usdPriceActual } : data));
  } else if (channel === WS_CHANNELS.BALANCES) {
    yield put(storeTokenBalancesDataAction(data.tokenBalances));
  } else if (channel === WS_CHANNELS.COLLATERAL_PRICES) {
    if (type === WS_DATA_TYPES.UPDATE) {
      if (Object.keys(data).length > 0) {
        const pricesMap = yield select(selectCollateralPrices);
        const storedPrice = pricesMap[data.tokenCode];

        if (data.indexPrice !== storedPrice) {
          yield put(updateCollateralPricesAction(data));
        }
      }
    } else if (data.length !== 0) {
      // snapshot
      yield put(initCollateralPricesAction(data));
    }
  } else if (channel === WS_CHANNELS.FUNDING) {
    yield put(storeFundingDataAction(data));
  }
}

function* batchTickerDataUpdate(data) {
  yield put(storeTickerDataBatchAction(data.map(({ payload }) => payload)));
}

/** Contract **/
function* fetchContracts() {
  const accountsLoaded = yield select(selectAccountsLoaded);
  const isLoggedIn = yield select(selectIsLoggedIn);
  const authedCall = accountsLoaded && isLoggedIn;
  const resp = yield call(api.fetchContracts, authedCall);

  const tokensResp = yield call(api.fetchTokens);

  if (resp.ok) {
    yield put(fetchContractsActions.success(resp.data));
  }

  if (tokensResp.ok) {
    yield put(fetchTokensActions.success(tokensResp.data));
  }
}

function* openGlobalContract({ payload: maybeContractCode }) {
  const contracts = yield select(selectContracts);
  const pathname = yield select(state => state.router.location.pathname);

  const contract =
    contracts[maybeContractCode] || Object.values(contracts).find(({ isExpired }) => !isExpired);

  if (contract) {
    const path = `/trader/${contract.contractCode}`;

    if (pathname === '/trader') {
      yield put(replace(path));
    } else {
      yield put(push(path));
    }
  } else {
    yield put(replace('/trader'));
  }
}

function* locationChange({ payload: { pathname } }) {
  const [, trader, contractCode] = pathname.split('/');

  if (trader === 'trader' && contractCode) {
    yield put(setGlobalContractAction(contractCode));
  }
}

function* resetBalanceData() {
  yield put(storeTokenBalancesDataAction({}));
}

export function* traderDataStoreSaga() {
  /** WebSocket **/
  yield takeEvery(RECEIVE_MESSAGE, receiveMessage);
  yield fullThrottle(500, BATCH_TICKER_DATA_UPDATE, batchTickerDataUpdate);

  /** Contract **/
  yield takeLatest(createActionType(FETCH_CONTRACTS, REQUEST), fetchContracts);
  yield takeEvery(OPEN_GLOBAL_CONTRACT, openGlobalContract);
  yield takeEvery(LOCATION_CHANGE, locationChange);
  yield takeLatest(SOFT_RELOAD_APP, resetBalanceData);
}
