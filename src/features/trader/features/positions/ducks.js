import { combineReducers } from 'redux';
import { put, takeEvery, takeLatest, call, select } from 'redux-saga/effects';
import mapValues from 'lodash.mapvalues';
import keyBy from 'lodash.keyby';
import pick from 'lodash.pick';
import BigNumber from 'bignumber.js';

import { Utils } from '@acdxio/common';

import { createMarkedSelector } from '../../../../common/utils/reduxHelpers';
import { CONTRACT_TYPE } from '../../../../common/enums';
import { selectIsLoggedIn } from '../../../../common/services/user';
import { startApiCall, finishApiCall } from '../../../../common/services/spinner'
import {
  createReducer,
  createActionCreator,
  createActionType,
  REQUEST,
} from '../../../../common/utils/reduxHelpers';
import {
  RECEIVE_MESSAGE,
  UPDATE_ACTIVITY_PERIOD_KEY,
  SOFT_RELOAD_APP,
} from '../../../../common/services/webSocket';
import { WS_CHANNELS, WS_DATA_TYPES } from '../../constants';
import { ORDER_STATUS } from '../orders/constants';
import transformDataMessage from '../../data-store/transformDataMessage';
import { selectContracts, selectSeriesSpecs, selectSeriesCodeFromContractCode, selectTickerData } from '../../data-store/ducks';

import { calculatePl, normalizePosition } from './utils';

export const apiCallIds = {
  FETCH_POSITIONS: 'FETCH_POSITIONS',
  FETCH_POSITIONS_WIDGET_CONFIG: 'FETCH_POSITIONS_WIDGET_CONFIG',
};

export const isSpreadContract = (contractCode, contractSpecs) => {
  // console.log('in isSpreadContract');
  // console.log({contractCode, contractSpecs});
  return contractSpecs && contractSpecs[contractCode] ? contractSpecs[contractCode].type === CONTRACT_TYPE.FUTURE_SPREAD : false;
};

const defaultContractMetadata = { priceDecimals: 8, sizeDecimals: 8 };

/**
 * ACTION TYPES
 */
export const FETCH_POSITIONS = 'positions/FETCH_POSITIONS';
export const INITIALIZE_DATA = 'positions/INITIALIZE_DATA';
export const ADD_NEW_POSIITON = 'positions/ADD_NEW_POSIITON';
export const UPDATE_POSITION = 'positions/UPDATE_POSITION';
export const UPDATE_POSITION_MARKED = 'positions/UPDATE_POSITION_MARKED';
export const UPDATE_PL = 'positions/UPDATE_PL';
export const SET_UNLOADED = 'positions/SET_UNLOADED';

/**
 * ACTIONS
 */
export const fetchPositionsAction = createActionCreator(FETCH_POSITIONS);
export const initializeDataAction = createActionCreator(INITIALIZE_DATA);
export const updatePositionAction = createActionCreator(UPDATE_POSITION);
export const updatePositionMarkedAction = createActionCreator(UPDATE_POSITION_MARKED);
export const setUnloadedAction = createActionCreator(SET_UNLOADED);

/**
 * REDUCERS
 */
const initialState = {
  rawById: {},
  markedById: {},
  loaded: false,
};

const rawFields = [
  'contractCode',
  'quantity',
  'hasPosition',
  'dayRelativeToDate',

  'averageEntryPrice',
  'dayRelativeAverageEntryPrice',

  'dayClosedPl',
  'dayRelativeClosedPl',

  'priceDecimals',
  'sizeDecimals',
];

const rawById = createReducer(initialState.rawById, {
  [INITIALIZE_DATA]: (_, positions) =>
    // TODO(AustinC): don't update `data` if no `data` fields are changing
    // (also, don't update anything if the only thing changing is a liquidation price)
    keyBy(
      positions.map(p => pick(p, rawFields)),
      ({ contractCode }) => contractCode
    ),
  [UPDATE_POSITION]: (raw, position) => ({
    ...raw,
    [position.contractCode]: pick(position, rawFields),
  }),
});

const markedFields = [
  'contractCode',
  'markPrice',
  'dollarizer',
  'unrealizedPl',
  'realizedPl',
  'totalPl',
  'dayPl',
  'marketValue',
  'liquidationPrice',

  'priceDecimals',
  'sizeDecimals',
];

const markedById = createReducer(initialState.markedById, {
  [INITIALIZE_DATA]: (_, positions) =>
    keyBy(
      positions.map(p => pick(p, markedFields)),
      'contractCode'
    ),
  [UPDATE_POSITION]: (marked, position) => ({
    ...marked,
    [position.contractCode]: pick(position, markedFields),
  }),
  [UPDATE_POSITION_MARKED]: (marked, position) => ({
    ...marked,
    [position.contractCode]: pick(position, markedFields),
  }),
});

const loaded = createReducer(initialState.loaded, {
  [INITIALIZE_DATA]: _ => true,
  [SET_UNLOADED]: _ => false,
});

export default combineReducers({
  // changes only when a trade is made (quantities, avg exec prices, etc.)
  // and at UTC midnight (for day-relative data)
  rawById,

  // changes when a marking price changes (includes PL)
  markedById,

  loaded,
});

/**
 * SELECTORS
 */
export const createContractFieldsSelector = fields =>
  createMarkedSelector(
    'createContractFieldsSelector',
    // commonly used to get margin info (hence, loading contracts w/ margins calced)
    selectContractsMapWithMargins,
    contracts => mapValues(contracts, contract => pick(contract, fields))
  );

// multi contract
export const selectPositions = state => state.positions;
export const selectPositionsData = state => selectPositions(state).rawById;
export const selectPositionsMarked = state => selectPositions(state).markedById;
export const selectPositionsLoaded = state => selectPositions(state).loaded;

const selectOrders = state => state.orders;
const selectOpenOrders = state => selectOrders(state).openOrders;
const selectActiveOrders = createMarkedSelector('selectActiveOrders', selectOpenOrders, orders =>
  orders.filter(({ status }) => status === ORDER_STATUS.ACCEPTED)
);


// sorted contract codes that have positions (or have day realized PL)
export const selectPositionsContracts = createMarkedSelector(
  'selectPositionsContracts',
  selectPositionsData,
  data => Object.keys(data).sort()
);

// [SeriesCode]: Array<{ contractCode: ContractCode, position: BigNumber }> }
const getPositionsBySeriesCode = (positions, selectSeriesCodeFromContractCode, longDirection) => {
  const filteredPositions = {};

  if (longDirection) {
    Object.values(positions).map( v => {
      const quantity = BigNumber(v.quantity);
      if (quantity.gt(0))
        filteredPositions[v.contractCode] = quantity
      return null;
    })
  } else {
    Object.values(positions).map( v => {
      const quantity = BigNumber(v.quantity);
      if (quantity.lt(0))
        filteredPositions[v.contractCode] = quantity
      return null;
    })
  }

  const positionsBySeries = {};

  for (const [key, value] of Object.entries(filteredPositions)) {
    const seriesCode = selectSeriesCodeFromContractCode[key];

    const contractCode = key;
    if (positionsBySeries[seriesCode]) {
      positionsBySeries[seriesCode].push({ contractCode, position: value });
    } else {
      positionsBySeries[seriesCode] = [{ contractCode, position: value }];
    }
  }

  return positionsBySeries;
}

// [SeriesCode]: Array<{ contractCode: ContractCode, position: BigNumber }> }
export const selectLongPositionsBySeriesCode = createMarkedSelector(
  'selectLongPositionsBySeriesCode',
  selectPositionsData,
  selectSeriesCodeFromContractCode,
  (positions, seriesCodeFromContractCode) => {
    return getPositionsBySeriesCode(positions, seriesCodeFromContractCode, true);
  }
);

export const selectShortPositionsBySeriesCode = createMarkedSelector(
  'selectShortPositionsBySeriesCode',
  selectPositionsData,
  selectSeriesCodeFromContractCode,
  (positions, seriesCodeFromContractCode) => {
    return getPositionsBySeriesCode(positions, seriesCodeFromContractCode, false);
  }
);

// [SeriesCode]: Array<{ contractCode: ContractCode, position: BigNumber }> } {
const getPositionsWithAcceptedOrdersBySeriesCode = (positions, orders, selectSeriesCodeFromContractCode, longDirection, contractSpecs) => {
//  const filteredPositions = {};
  const buyOrders = {};
  const sellOrders = {};

  // console.log('in getPositionsWithAcceptedOrdersBySeriesCode');
  // console.log({positions, orders, selectSeriesCodeFromContractCode, longDirection, contractSpecs});

  orders.forEach( v => {
    const side = v.side;

    const size = BigNumber(v.size);
    const sizeFilled = BigNumber(v.sizeFilled);      
  
    const quantity = size.minus(sizeFilled);

    const isSpread = isSpreadContract(v.contractCode, contractSpecs);

    if (side === 'buy') {
      buyOrders[v.contractCode] = buyOrders[v.contractCode] ? buyOrders[v.contractCode].plus(BigNumber(quantity)) : BigNumber(quantity);

      if (isSpread) {
        sellOrders[v.contractCode] = sellOrders[v.contractCode] ? sellOrders[v.contractCode].plus(BigNumber(quantity).negated()) : BigNumber(quantity).negated();
      }      
    } else {
      sellOrders[v.contractCode] = sellOrders[v.contractCode] ? sellOrders[v.contractCode].plus(BigNumber(quantity).negated()) : BigNumber(quantity).negated();
      if (isSpread) {
        buyOrders[v.contractCode] = buyOrders[v.contractCode] ? buyOrders[v.contractCode].plus(BigNumber(quantity)) : BigNumber(quantity);
      }
    };
  });

  let ordersToAdd;
  if (longDirection)
    ordersToAdd = {...buyOrders}
  else
    ordersToAdd = {...sellOrders}

  // add positions and orders of same direction
  const filteredPositionsAndOrders = [positions, ordersToAdd].reduce( (acc, obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (!acc[key]) {
          acc[key] = BigNumber(0);
      }

      const position  = value.quantity ? value.quantity : value
      acc[key] = acc[key].plus(position);
    }
    return acc;
  },
  {}
  );

  const finalFilteredPositionsAndOrders = {}
  if (longDirection) {
    for (const [key, value] of Object.entries(filteredPositionsAndOrders)) {
      const quantity = BigNumber(value);
      if (quantity.gt(0))
        finalFilteredPositionsAndOrders[key] = quantity
    };
  } else {
    for (const [key, value] of Object.entries(filteredPositionsAndOrders)) {
      const quantity = BigNumber(value);
      if (quantity.lt(0))
        finalFilteredPositionsAndOrders[key] = quantity
    };
  }

  const positionsWithAcceptedOrdersBySeriesCode = {};

  for (const [key, value] of Object.entries(finalFilteredPositionsAndOrders)) {
    const seriesCode = selectSeriesCodeFromContractCode[key];

    const contractCode = key;
    if (positionsWithAcceptedOrdersBySeriesCode[seriesCode]) {
      positionsWithAcceptedOrdersBySeriesCode[seriesCode].push({ contractCode, position: value });
    } else {
      positionsWithAcceptedOrdersBySeriesCode[seriesCode] = [{ contractCode, position: value }];
    }
  }

  // console.log({location: 'in getPositionsWithAcceptedOrdersBySeriesCode end', positions, orders, filteredPositionsAndOrders, finalFilteredPositionsAndOrders, positionsWithAcceptedOrdersBySeriesCode});
  return positionsWithAcceptedOrdersBySeriesCode;
}

export const selectLongPositionsWithAcceptedOrdersBySeriesCode = createMarkedSelector(
  'selectLongPositionsWithAcceptedOrdersBySeriesCode',
  selectPositionsData,
  selectActiveOrders,
  selectSeriesCodeFromContractCode,
  selectContracts,
  (positions, orders, seriesCodeFromContractCode, contractSpecs) => {
    return getPositionsWithAcceptedOrdersBySeriesCode(positions, orders, seriesCodeFromContractCode, true, contractSpecs);
  }
);

const getPositionsWithAcceptedOrdersQuantityBySeriesCode = (positionsWithAcceptedOrdersQuantityBySeriesCode) => {
  const positionsWithAcceptedOrdersQuantityBySeries = {}

  for (const [key, value] of Object.entries(positionsWithAcceptedOrdersQuantityBySeriesCode)) {
    positionsWithAcceptedOrdersQuantityBySeries[key] = Object.values(value).reduce(
      (acc, obj) => acc.plus(obj.position),
    BigNumber(0)
    );
  }

  return positionsWithAcceptedOrdersQuantityBySeries;
}

export const selectLongPositionsWithAcceptedOrdersQuantityBySeriesCode = createMarkedSelector(
  'selectLongPositionsWithAcceptedOrdersQuantityBySeriesCode',
  selectLongPositionsWithAcceptedOrdersBySeriesCode,
  (longPositionsWithAcceptedOrdersBySeriesCode) => {

    const longPositionsWithAcceptedOrdersQuantityBySeriesCode = getPositionsWithAcceptedOrdersQuantityBySeriesCode(longPositionsWithAcceptedOrdersBySeriesCode);

    // console.log('in selectLongPositionsWithAcceptedOrdersQuantityBySeriesCode');
    // console.log({longPositionsWithAcceptedOrdersQuantityBySeriesCode})
    return longPositionsWithAcceptedOrdersQuantityBySeriesCode
  }
);

export const selectShortPositionsWithAcceptedOrdersBySeriesCode = createMarkedSelector(
  'selectShortPositionsWithAcceptedOrdersBySeriesCode',
  selectPositionsData,
  selectActiveOrders,
  selectSeriesCodeFromContractCode,
  selectContracts,
  (positions, orders, seriesCodeFromContractCode, contractSpecs) => {
    return getPositionsWithAcceptedOrdersBySeriesCode(positions, orders, seriesCodeFromContractCode, false, contractSpecs);
  }
);

export const selectShortPositionsWithAcceptedOrdersQuantityBySeriesCode = createMarkedSelector(
  'selectShortPositionsWithAcceptedOrdersQuantityBySeriesCode',
  selectShortPositionsWithAcceptedOrdersBySeriesCode,
  (shortPositionsWithAcceptedOrdersBySeriesCode) => {
    // console.log('in selectShortPositionsWithAcceptedOrdersQuantityBySeriesCode');
    const shortPositionsWithAcceptedOrdersQuantityBySeriesCode = getPositionsWithAcceptedOrdersQuantityBySeriesCode(shortPositionsWithAcceptedOrdersBySeriesCode);

    
    // console.log({shortPositionsWithAcceptedOrdersQuantityBySeriesCode});
    return shortPositionsWithAcceptedOrdersQuantityBySeriesCode;
  }
);

export const selectLongPositionsWithAcceptedOrdersBySeriesCodeExcluded = createMarkedSelector(
  'selectLongPositionsWithAcceptedOrdersBySeriesCodeExcluded',
  selectLongPositionsWithAcceptedOrdersBySeriesCode,
  selectSeriesCodeFromContractCode,
  (_, contractCode) => contractCode, // exclude contract
  (longPositionsWithAcceptedOrdersBySeriesCode, seriesCodeFromContractCode, excludedContract) => {
    const seriesCode = seriesCodeFromContractCode[excludedContract];
    const longPositionsWithAcceptedOrdersBySeriesCodeExcluded = {...longPositionsWithAcceptedOrdersBySeriesCode};

    longPositionsWithAcceptedOrdersBySeriesCodeExcluded[seriesCode] = 
    longPositionsWithAcceptedOrdersBySeriesCode[seriesCode] ?
      longPositionsWithAcceptedOrdersBySeriesCode[seriesCode].filter(obj => obj && (obj.contractCode !== excludedContract)) :
      []

    // console.log('in selectLongPositionsWithAcceptedOrdersBySeriesCodeExcluded')
    // console.log({longPositionsWithAcceptedOrdersBySeriesCode, excludedContract, longPositionsWithAcceptedOrdersBySeriesCodeExcluded});

    return longPositionsWithAcceptedOrdersBySeriesCodeExcluded;
  }
);

export const selectLongPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded = createMarkedSelector(
  'selectLongPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded',
  selectLongPositionsWithAcceptedOrdersBySeriesCodeExcluded,
  (longPositionsWithAcceptedOrdersBySeriesCodeExcluded) => {
    // console.log('in selectShortPositionsWithAcceptedOrdersQuantityBySeriesCode');
    const longPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded = getPositionsWithAcceptedOrdersQuantityBySeriesCode(longPositionsWithAcceptedOrdersBySeriesCodeExcluded);
    
    // console.log({longPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded});
    return longPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded;
  }
);

export const selectShortPositionsWithAcceptedOrdersBySeriesCodeExcluded = createMarkedSelector(
  'selectShortPositionsWithAcceptedOrdersBySeriesCodeExcluded',
  selectShortPositionsWithAcceptedOrdersBySeriesCode,
  selectSeriesCodeFromContractCode,
  (_, contractCode) => contractCode, // exclude contract
  (shortPositionsWithAcceptedOrdersBySeriesCode, seriesCodeFromContractCode, excludedContract) => {
    const seriesCode = seriesCodeFromContractCode[excludedContract];
    const shortPositionsWithAcceptedOrdersBySeriesCodeExcluded = {...shortPositionsWithAcceptedOrdersBySeriesCode};

    shortPositionsWithAcceptedOrdersBySeriesCodeExcluded[seriesCode] =
      shortPositionsWithAcceptedOrdersBySeriesCode[seriesCode] ?
      shortPositionsWithAcceptedOrdersBySeriesCode[seriesCode].filter(obj => obj && (obj.contractCode !== excludedContract)) :
      []

    // console.log('in selectShortPositionsWithAcceptedOrdersBySeriesCodeExcluded')
    // console.log({shortPositionsWithAcceptedOrdersBySeriesCode, excludedContract, shortPositionsWithAcceptedOrdersBySeriesCodeExcluded});

    return shortPositionsWithAcceptedOrdersBySeriesCodeExcluded;
  }
);

export const selectShortPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded = createMarkedSelector(
  'selectShortPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded',
  selectShortPositionsWithAcceptedOrdersBySeriesCodeExcluded,
  (shortPositionsWithAcceptedOrdersBySeriesCodeExcluded) => {
    // console.log('in selectShortPositionsWithAcceptedOrdersQuantityBySeriesCode');
    const shortPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded = getPositionsWithAcceptedOrdersQuantityBySeriesCode(shortPositionsWithAcceptedOrdersBySeriesCodeExcluded);

    
    // console.log({shortPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded});
    return shortPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded;
  }
);



const getmaxLongShortPositionSizeBySeries = (seriesSpecs, longPositionsBySeriesCode, shortPositionsBySeriesCode) => {
  let maxPositionsBySeries = {};
    const allSeries = Object.keys(seriesSpecs);

    allSeries.forEach((k) => {
      const longPos = longPositionsBySeriesCode[k] ?
        longPositionsBySeriesCode[k].reduce(
          (acc, obj) => acc.plus(obj.position), BigNumber(0)) : BigNumber(0);

      const shortPos = shortPositionsBySeriesCode[k] ?
        shortPositionsBySeriesCode[k].reduce(
          (acc, obj) => acc.plus(obj.position), BigNumber(0)) : BigNumber(0);

      maxPositionsBySeries[k] = BigNumber.maximum(longPos, shortPos.abs());
    });

    return maxPositionsBySeries;
};

// { [SeriesCode]: BigNumber }
export const selectMaxLongShortPositionSizeBySeries = createMarkedSelector(
  'selectMaxLongShortPositionSizeBySeries',
  selectSeriesSpecs,
  selectLongPositionsBySeriesCode,
  selectShortPositionsBySeriesCode,
  getmaxLongShortPositionSizeBySeries
);

export const selectMaxLongShortPositionAndAcceptedOrdersSizeBySeries = createMarkedSelector(
  'selectMaxLongShortPositionAndAcceptedOrdersSizeBySeries',
  selectSeriesSpecs,
  selectLongPositionsWithAcceptedOrdersBySeriesCode,
  selectShortPositionsWithAcceptedOrdersBySeriesCode,
  getmaxLongShortPositionSizeBySeries
);

export const selectMaxLongShortPositionAndAcceptedOrdersSizeBySeriesExcluded = createMarkedSelector(
  'selectMaxLongShortPositionAndAcceptedOrdersSizeBySeriesExcluded',
  selectSeriesSpecs,
  selectLongPositionsWithAcceptedOrdersBySeriesCodeExcluded,
  selectShortPositionsWithAcceptedOrdersBySeriesCodeExcluded,
  getmaxLongShortPositionSizeBySeries
);

export const selectAdjustedPositionsAndAcceptedOrdersNotionalBySeries = createMarkedSelector(
  'selectAdjustedPositionsAndAcceptedOrdersNotionalBySeries',
  selectMaxLongShortPositionAndAcceptedOrdersSizeBySeries,
  selectSeriesCodeFromContractCode,
  selectTickerData,
  selectSeriesSpecs,
  (_, contractCode) => contractCode,
  (maxLongShortPositionAndAcceptedOrdersSizeBySeries, seriesCodeFromContractCode, tickerData, seriesSpecs, contractCode) => {
    
    // console.log('in selectAdjustedPositionsAndAcceptedOrdersNotionalBySeriess');
    // console.log({maxLongShortPositionAndAcceptedOrdersSizeBySeries, seriesCodeFromContractCode, tickerData, seriesSpecs, contractCode});

    const adjustedPositionsAndAcceptedOrdersNotionalBySeries = Utils.mapDictByEntries(maxLongShortPositionAndAcceptedOrdersSizeBySeries,
      ([seriesCode, maxLongShortPositionAndAcceptedOrdersSize]) => {
        return (!!seriesSpecs[seriesCode] && !!tickerData[contractCode]) ?
        maxLongShortPositionAndAcceptedOrdersSize.times(seriesSpecs[seriesCode].positionLimitAdjustment).times(tickerData[contractCode].indexPrice) :
          BigNumber(0)})
    
    // console.log({adjustedPositionsAndAcceptedOrdersNotionalBySeries});

    return adjustedPositionsAndAcceptedOrdersNotionalBySeries;
  }
);

export const selectPositionsQuantityMarkPrice = createMarkedSelector(
  'selectPositionsQuantityMarkPrice',
  selectPositionsContracts,
  selectPositionsData,
  selectPositionsMarked,
  (contracts, posData, posMarked) =>
    keyBy(
      contracts.map(contractCode => ({
        contractCode,
        quantity: posData[contractCode].quantity,
        markPrice: posMarked[contractCode].markPrice,
        dollarizer: posMarked[contractCode].dollarizer,
      })),
      'contractCode'
    )
);

export const selectContractsMapWithMargins = createMarkedSelector(
  'selectContractsMapWithMargins',
  selectContracts,
  selectPositionsQuantityMarkPrice,
  selectTickerData,
  (contracts, positionMap, tickerData) =>
    mapValues(contracts, contract => {
      if (contract.type === CONTRACT_TYPE.SPOT) {
        return {
          ...contract,
          initialMargin: '0',
          initialMarginPercent: '0',
          maintenanceMargin: '0',
          maintenanceMarginPercent: '0',
          liquidationMargin: '0',
          liquidationMarginPercent: '0',
        };
      }
      const {
        contractCode,
//        seriesCode,
        initialMarginBase,
        initialMarginPerContract,
        maintenanceInitialRatio,
        liquidationInitialRatio,
//        seriesMarginMultiplier,
//        positionLimitAdjustment,
      } = contract;

      const absQuantity = positionMap[contractCode]
        ? BigNumber(positionMap[contractCode].quantity).abs()
        : 0;
      const markPrice =
        (positionMap[contractCode] || {}).markPrice || (tickerData[contractCode] || {}).markPrice;
      const dollarizer =
        (positionMap[contractCode] || {}).dollarizer || (tickerData[contractCode] || {}).dollarizer;

      const initialMarginPercent = BigNumber(initialMarginBase).plus(
        BigNumber(initialMarginPerContract).times(absQuantity)
      );
      const initialMargin = initialMarginPercent.times(markPrice).times(dollarizer);
      const maintenanceMargin = initialMargin.times(maintenanceInitialRatio);
      const liquidationMargin = initialMargin.times(liquidationInitialRatio);
      return {
        ...contract,
        initialMargin: initialMargin.toString(),
        initialMarginPercent: initialMarginPercent.dp(4).toString(),
        maintenanceMargin: maintenanceMargin.toString(),
        liquidationMargin: liquidationMargin.toString(),
        liquidationMarginPercent: liquidationMargin
          .dividedBy(
            positionMap[contractCode] ? positionMap[contractCode].markPrice : contract.markPrice
          )
          .dp(4)
          .toString(),
        markPrice,
        dollarizer,
      };
    })
);

export const selectSeriesQuantityMarkPrice = createMarkedSelector(
  'selectPositionsQuantityMarkPrice',
  selectPositionsContracts,
  selectPositionsData,
  selectPositionsMarked,
  (contracts, posData, posMarked) =>
    keyBy(
      contracts.map(contractCode => ({
        contractCode,
        quantity: posData[contractCode].quantity,
        markPrice: posMarked[contractCode].markPrice,
        dollarizer: posMarked[contractCode].dollarizer,
      })),
      'contractCode'
    )
);

// single contract
export const selectPositionData = (store, contractCode) => selectPositionsData(store)[contractCode];

export const selectPositionMarked = (store, contractCode) =>
  selectPositionsMarked(store)[contractCode];

export const selectPositionQuantity = (store, contractCode) =>
  (selectPositionsData(store)[contractCode] || {}).quantity || '0';

export const selectHasOpenPosition = (store, contractCode) =>
  (selectPositionsData(store)[contractCode] || {}).hasPosition || false;

export const selectPosition = createMarkedSelector(
  'selectPosition',
  selectPositionData, // requires prop: contractCode
  selectPositionMarked,
  (posData, posMarked) => ({
    ...posData,
    ...posMarked,
  })
);

export const selectOpenPositionsCount = createMarkedSelector(
  'selectOpenPositionsCount',
  selectPositionsData,
  posData => Object.values(posData).filter(({ quantity }) => !BigNumber(quantity).isZero()).length,
);

/**
 * SAGAS
 */

function* initializePositions() {
  const isLoggedIn = yield select(selectIsLoggedIn);
  if (!isLoggedIn) {
    return;
  }

  yield put(startApiCall({ apiCallId: apiCallIds.FETCH_POSITIONS }));
}

function* handlePositionsMessage({ data, type }) {
  const contracts = yield select(selectContracts);
  const tickerData = yield select(selectTickerData);

  if (type === WS_DATA_TYPES.SNAPSHOT) {
    const positions = data.map(position => {
      const contract = contracts[position.contractCode] || defaultContractMetadata;

      // if ticker data isn't loaded yet, don't mark position (it will be marked
      // when ticker data updates)
      const { markPrice, dollarizer } = tickerData[position.contractCode] || { dollarizer: 1 };
      const pl = !!markPrice ? calculatePl(position, markPrice, dollarizer) : {};

      return normalizePosition({ ...position, ...pl }, contract, dollarizer);
    });
    yield put(initializeDataAction(positions));
    yield put(finishApiCall({ apiCallId: apiCallIds.FETCH_POSITIONS }));
  } else {
    const position = yield select(selectPositionData, data.contractCode);

    const contract = contracts[data.contractCode] || defaultContractMetadata;
    const { markPrice, dollarizer } = tickerData[data.contractCode] || { dollarizer: 1 };

    if (position) {
      if (
        BigNumber(data.averageEntryPrice).isEqualTo(position.averageEntryPrice) &&
        BigNumber(data.quantity).isEqualTo(position.quantity) &&
        data.dayRelativeToDate === position.dayRelativeToDate
      ) {
        // update for est liq price, ignore it since we calc this on FE
        return;
      }

      // re-mark the position
      const pl = !!markPrice ? calculatePl(data, markPrice, dollarizer) : {};
      const updatedPosition = normalizePosition({ ...data, ...pl }, contract, dollarizer);

      yield put(updatePositionAction(updatedPosition));
    } else {
      // mark the position
      const pl = !!markPrice ? calculatePl(data, markPrice, dollarizer) : {};
      const newPosition = normalizePosition({ ...data, ...pl }, contract, dollarizer);

      yield put(updatePositionAction(newPosition));
    }
  }
}

function* handleTickerMessage(data) {
  const position = yield select(selectPosition, data.contractCode);

  // if position exists at all (may not necessarily have a current position)
  if (position.contractCode) {
    const contracts = yield select(selectContracts);
    const contract = contracts[position.contractCode] || defaultContractMetadata;

    const { markPrice, dollarizer } = data;
    if (position.markPrice !== markPrice || position.dollarizer !== dollarizer) {
      const pl = calculatePl(position, markPrice, dollarizer);
      const newPosition = normalizePosition({ ...position, ...pl }, contract, dollarizer);

      yield put(updatePositionMarkedAction(newPosition));
    }
  }
}

function* receiveMessage({ payload }) {
  const { channel, type } = payload;

  if (channel === WS_CHANNELS.POSITIONS) {
    yield call(handlePositionsMessage, { data: payload.data, type });
  } else if (channel === WS_CHANNELS.TICKER) {
    const contracts = yield select(selectContracts) || {};
    const { data } = transformDataMessage(
      payload,
      payload.data && contracts[payload.data.contractCode]
        ? contracts[payload.data.contractCode]
        : undefined
    );
    yield call(handleTickerMessage, data);
  }
}

function* resetPositions() {
  yield put(initializeDataAction([]));
  yield put(setUnloadedAction());
}

function* setUnloaded() {
  yield put(setUnloadedAction());
}

export function* positionsSaga() {
  yield takeLatest(createActionType(FETCH_POSITIONS, REQUEST), initializePositions);
  yield takeEvery(RECEIVE_MESSAGE, receiveMessage); // TODO refactor
  yield takeEvery(UPDATE_ACTIVITY_PERIOD_KEY, setUnloaded);
  yield takeEvery(SOFT_RELOAD_APP, resetPositions);
}
