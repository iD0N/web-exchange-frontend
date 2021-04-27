import BigNumber from 'bignumber.js';
import _ from 'lodash';
import { Utils } from '@acdxio/common';

import { createMarkedSelector } from '../../../../common/utils/reduxHelpers';
import { selectMaxLeverage } from '../../../../common/services/user';

import { ORDER_STATUS } from '../orders/constants';
import {
  selectTokenBalances,
  selectTokenBalancesLoaded,
  selectCollateralTokens,
  selectCollateralValue,
  selectCollateralValueWithoutHaircut,
  selectContracts,
  selectMarkPrice,
  selectDollarizer,
  selectTickerData,
  selectSeriesSpecs,
  selectSeriesCodeFromContractCode,
} from '../../data-store/ducks';
import {
  // multiple
  selectPositionsData,
  selectPositionsMarked,
  selectPositionsLoaded,

  // single
  selectPositionQuantity,

  // position-related
  // selectLongPositionsQuantity,

  // position margin-related
  selectMaxLongShortPositionSizeBySeries,
  selectMaxLongShortPositionAndAcceptedOrdersSizeBySeries,
  selectMaxLongShortPositionAndAcceptedOrdersSizeBySeriesExcluded,
  selectLongPositionsBySeriesCode,
  selectShortPositionsBySeriesCode,
  selectLongPositionsWithAcceptedOrdersBySeriesCode,
  selectShortPositionsWithAcceptedOrdersBySeriesCode,
  selectLongPositionsWithAcceptedOrdersBySeriesCodeExcluded,
  selectShortPositionsWithAcceptedOrdersBySeriesCodeExcluded,
  selectAdjustedPositionsAndAcceptedOrdersNotionalBySeries,
  selectLongPositionsWithAcceptedOrdersQuantityBySeriesCode,
  selectShortPositionsWithAcceptedOrdersQuantityBySeriesCode,
  selectLongPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded,
  selectShortPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded,
} from '../positions/ducks';

import { isSpreadContract } from '../positions/ducks';

import { ZERO_BALANCE_VALUE } from './constants';
import {
  aggregatePl,
  getNetLiquidationValue,
  normalizeAccountSummary,
  getMaxPositionForFunds,
} from './helpers';

const MAINTENANCE_INITIAL_RATIO = BigNumber(0.75);
const LIQUIDATION_INITIAL_RATIO = BigNumber(0.6)
const MAX_ADJUSTED_POSITION_SIZE_FOR_50X_OR_GREATER_ACCOUNTS = BigNumber(1000000);

/**
 * SELECTORS
 */
const selectOrders = state => state.orders;
const selectOpenOrders = state => selectOrders(state).openOrders;
const selectActiveOrders = createMarkedSelector('selectActiveOrders', selectOpenOrders, orders =>
  orders.filter(({ status }) => status === ORDER_STATUS.ACCEPTED)
);

const selectPl = createMarkedSelector('selectPl', selectPositionsMarked, aggregatePl);

const selectBaseInitialMarginRatio = createMarkedSelector(
  'selectBaseInitialMarginRatio',
  selectMaxLeverage,
  maxAccountLeverage => {
    if (!maxAccountLeverage)
      return BigNumber(1).dividedBy(BigNumber(20)) // default to 20x initially

    return BigNumber(1).dividedBy(maxAccountLeverage)
  }
)

const getInitialMarginRatioBySeries = (seriesSpecs, baseInitialMarginRatio, maxLongShortPositionSizeBySeries) => {
  const positionInitialMarginRatioBySeries = {};
    const allSeries = Object.keys(seriesSpecs);

    allSeries.forEach((k) => {
      const seriesMarginMultiplier = seriesSpecs[k].seriesMarginMultiplier ?
        BigNumber(seriesSpecs[k].seriesMarginMultiplier) : BigNumber(1);
      positionInitialMarginRatioBySeries[k] = BigNumber.maximum(
        baseInitialMarginRatio,
        seriesMarginMultiplier.times((maxLongShortPositionSizeBySeries[k]).sqrt()),
      );
    });

    return positionInitialMarginRatioBySeries;
}

//  { [SeriesCode]: BigNumber }
const selectPositionInitialMarginRatioBySeries = createMarkedSelector(
  'selectPositionInitialMarginRatioBySeries',
  selectSeriesSpecs,
  selectBaseInitialMarginRatio,
  selectMaxLongShortPositionSizeBySeries,
  getInitialMarginRatioBySeries
)

//  { [SeriesCode]: BigNumber }
const selectPositionAndAcceptedOrdersInitialMarginRatioBySeries = createMarkedSelector(
  'selectPositionInitialMarginRatioBySeries',
  selectSeriesSpecs,
  selectBaseInitialMarginRatio,
  selectMaxLongShortPositionAndAcceptedOrdersSizeBySeries,
  getInitialMarginRatioBySeries
)

const selectPositionAndAcceptedOrdersInitialMarginRatioBySeriesExcluded = createMarkedSelector(
  'selectPositionInitialMarginRatioBySeries',
  selectSeriesSpecs,
  selectBaseInitialMarginRatio,
  selectMaxLongShortPositionAndAcceptedOrdersSizeBySeriesExcluded,
  getInitialMarginRatioBySeries
)

const getMarginForSeries = (seriesCode, positionsBySeriesCode, tickerData, contractSpecs) => {
  let margin = BigNumber(0);

  if (_.isEmpty(tickerData))
    return BigNumber(0);

  if (positionsBySeriesCode[seriesCode]) {
    const marginArray = (positionsBySeriesCode[seriesCode].map(
      obj => {
        // console.log({objContractCode: obj.contractCode, contractSpecs});
        const isSpread = isSpreadContract(obj.contractCode, contractSpecs);
        const individualContractCode =  isSpread ?
              contractSpecs[obj.contractCode].spreadContractCodeFront : obj.contractCode;
        
        // console.log({isSpread, individualContractCode, objContractCode: obj.contractCode, contractSpecs})

        return tickerData[individualContractCode] ? BigNumber(tickerData[individualContractCode].markPrice).abs()
          .times(tickerData[individualContractCode].dollarizer).times(obj.position.abs()) : BigNumber(0);
      }))

      margin = Utils.bigSum(marginArray);
  };

  return margin;
};

const getMarginCalc = (seriesSpecs, tickerData, positionInitialMarginRatioBySeries, longPositionsBySeriesCode, shortPositionsBySeriesCode, contractSpecs) => {
  const margin = {};
  const allSeries = Object.keys(seriesSpecs);

  // console.log({seriesSpecs, tickerData, positionInitialMarginRatioBySeries, longPositionsBySeriesCode, shortPositionsBySeriesCode});

  allSeries.forEach((k) => {
    const marginForLongs = getMarginForSeries(k, longPositionsBySeriesCode, tickerData, contractSpecs);
    const marginForShorts = getMarginForSeries(k, shortPositionsBySeriesCode, tickerData, contractSpecs);

    let imr = BigNumber.maximum(
      marginForLongs,
      marginForShorts,
    ).times(positionInitialMarginRatioBySeries[k]);
      
    if (imr.isNaN())
      imr = BigNumber(0);
    
    margin[k] = {
      initialMargin: imr,
      maintenanceMargin: imr.times(MAINTENANCE_INITIAL_RATIO),
      liquidationMargin: imr.times(LIQUIDATION_INITIAL_RATIO),
      marginForLongs,
      marginForShorts,
    };

    // console.log({k, marginForLongs, marginForShorts, positionInitialMarginRatioBySeries: positionInitialMarginRatioBySeries[k], imr, margin: margin[k]});
  });

  return margin;
};

const reduceMargin = (marginRequired) => {
  const margins = Object.values(marginRequired).reduce( (acc, obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (!acc[key]) {
          acc[key] = BigNumber(0);
      }

      acc[key] = acc[key].plus(value);
    }
    return acc;
  },
  {}
  );

  const finalMargins = Object.keys(margins).reduce(
    (map, key) => ({
      ...map,
      [key]: margins[key].isZero() ? ZERO_BALANCE_VALUE : margins[key].toString(),
    }),
    {}
  );

  // console.log({finalMargins});
  return finalMargins;
}

const selectMarginsRequiredBySeries = createMarkedSelector(
  'selectMarginsRequiredBySeries',  
  selectSeriesSpecs,
  selectTickerData,
  selectPositionInitialMarginRatioBySeries,
  selectLongPositionsBySeriesCode,
  selectShortPositionsBySeriesCode,
  (seriesSpecs, tickerData, positionInitialMarginRatioBySeries, longPositionsBySeriesCode, shortPositionsBySeriesCode) => {
    return getMarginCalc(seriesSpecs, tickerData, positionInitialMarginRatioBySeries, longPositionsBySeriesCode, shortPositionsBySeriesCode, null);
  }
)

const selectMargins = createMarkedSelector(
  'selectMargins',
  selectMarginsRequiredBySeries,
  (marginRequired) => {
    const marginRequiredTotal = reduceMargin(marginRequired);

    return marginRequiredTotal;
  }
);

const selectMarginsReservedBySeries = createMarkedSelector(
  'selectMarginsReservedBySeries',
  selectSeriesSpecs,
  selectTickerData,
  selectActiveOrders,
  selectPositionAndAcceptedOrdersInitialMarginRatioBySeries,
  selectLongPositionsWithAcceptedOrdersBySeriesCode,
  selectShortPositionsWithAcceptedOrdersBySeriesCode,
  selectContracts,
  (seriesSpecs, tickerData, orders, positionAndAcceptedOrdersInitialMarginRatioBySeries, longPositionsWithAcceptedOrdersBySeriesCode, shortPositionsWithAcceptedOrdersBySeriesCode, contractSpecs) => {
    return getMarginCalc(seriesSpecs, tickerData, positionAndAcceptedOrdersInitialMarginRatioBySeries, longPositionsWithAcceptedOrdersBySeriesCode, shortPositionsWithAcceptedOrdersBySeriesCode, contractSpecs);
  }
);

const selectMarginsReserved = createMarkedSelector(
  'selectMarginsReserved',
  selectMarginsReservedBySeries,
  (marginReserved) => {
    const marginReservedTotal = reduceMargin(marginReserved).initialMargin;

    // console.log({marginReservedTotal});

    return marginReservedTotal ? marginReservedTotal : ZERO_BALANCE_VALUE;
  }
);

const selectMarginsReservedBySeriesExcluded = createMarkedSelector(
  'selectMarginsReservedExcluded',
  selectSeriesSpecs,
  selectTickerData,
  selectPositionAndAcceptedOrdersInitialMarginRatioBySeriesExcluded,
  selectLongPositionsWithAcceptedOrdersBySeriesCodeExcluded,
  selectShortPositionsWithAcceptedOrdersBySeriesCodeExcluded,
  (seriesSpecs, tickerData, positionAndAcceptedOrdersInitialMarginRatioBySeries, longPositionsWithAcceptedOrdersBySeriesCode, shortPositionsWithAcceptedOrdersBySeriesCode) => {

    const marginReservedExcluded = getMarginCalc(seriesSpecs, tickerData, positionAndAcceptedOrdersInitialMarginRatioBySeries, longPositionsWithAcceptedOrdersBySeriesCode, shortPositionsWithAcceptedOrdersBySeriesCode);

    // console.log('in selectMarginsReservedExcluded');
    // console.log({seriesSpecs, tickerData, positionAndAcceptedOrdersInitialMarginRatioBySeries, longPositionsWithAcceptedOrdersBySeriesCode, shortPositionsWithAcceptedOrdersBySeriesCode});  
    // console.log({marginReservedExcluded});
    return marginReservedExcluded ? marginReservedExcluded : ZERO_BALANCE_VALUE;
  }
);

export const selectNlv = createMarkedSelector(
  'selectNlv',
  selectCollateralValue,
  selectPl,
  getNetLiquidationValue
);

export const selectNlvWithoutHaircut = createMarkedSelector(
  'selectNlv',
  selectCollateralValueWithoutHaircut,
  selectPl,
  getNetLiquidationValue
);

export const selectAccountSummaryData = createMarkedSelector(
  'selectAccountSummaryData',
  selectTokenBalances,
  selectMarginsReserved,
  selectPl,
  selectNlv,
  selectNlvWithoutHaircut,
  selectMargins,
  selectPositionsLoaded,
  selectTokenBalancesLoaded,
  selectCollateralTokens,
  normalizeAccountSummary
);

// used to compute max buy/sell
const selectFundsExcludingSeries = createMarkedSelector(
  'selectFundsExcludingSeries',
  selectNlv,
  selectMarginsReserved,
  selectMarginsReservedBySeries,
  (_, contractCode) => contractCode,
  selectSeriesCodeFromContractCode,
  (nlv, initialMarginReservedTotal, marginReservedBySeries, excludedContract, seriesCodeFromContractCode) => {
    const seriesCode = seriesCodeFromContractCode[excludedContract];
    
    const availableFundsAfterAllHolds = BigNumber(nlv).minus(initialMarginReservedTotal);
    
    const fundsRemaining = availableFundsAfterAllHolds.plus(marginReservedBySeries[seriesCode] ?
      marginReservedBySeries[seriesCode].initialMargin : BigNumber(0));
      
    // console.log('in selectFundsExcludingContract')
    // console.log({marginReservedBySeries})
    // console.log({fundsRemaining})

    return fundsRemaining;
  }
);

const selectActiveOrdersSizesOfContract = createMarkedSelector(
  'selectActiveOrdersSizesOfContract',
  selectActiveOrders,
  (_, contractCode) => contractCode,
  (orders, contractCode) => {
    const map = { buy: BigNumber(0), sell: BigNumber(0) };
    orders.forEach(({ contractCode: code, side, size, sizeFilled }) => {
      if (contractCode === code) {
        map[side] = map[side].plus(size).minus(sizeFilled || 0);
      }
    });
    return map;
  }
);

export const selectEffectiveLeverage = createMarkedSelector(
  'selectEffectiveLeverage',
  selectPl,
  selectNlv,
  ({ totalMarketValue }, netLiquidationValue) => 
      BigNumber(totalMarketValue).isZero() ||
      BigNumber(netLiquidationValue).isZero() ||
      BigNumber(netLiquidationValue).isNegative()
        ? 1
        : BigNumber(totalMarketValue)
            .dividedBy(netLiquidationValue)
            .dp(2)
            .toNumber(),
);

const getPositionLimit = (seriesCode, contractCode, maxAccountLeverage, adjustedPositionsAndAcceptedOrdersNotionalBySeries, 
  positions, tickerData, seriesSpecs, longPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded,
  shortPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded, isSpread) => {
  
  // console.log({location: 'getPositionLimit begin', seriesCode, contractCode, maxAccountLeverage, adjustedPositionsAndAcceptedOrdersNotionalBySeries, positions,
  //   longPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded, shortPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded, isSpread});

  if (maxAccountLeverage.lt(50)) {
    return { positionLimitLong: null, positionLimitShort: null };
  }

  if (!seriesSpecs[seriesCode] || !tickerData[contractCode] || !seriesSpecs[seriesCode].positionLimitAdjustment)
    return { positionLimitLong: null, positionLimitShort: null };

  let adjustedPositionsAndAcceptedOrdersNotionalSum = BigNumber(0);
  for (const [key, value] of Object.entries(adjustedPositionsAndAcceptedOrdersNotionalBySeries)) {
    if (key !== seriesCode && value && !value.isNaN()) {
      adjustedPositionsAndAcceptedOrdersNotionalSum = adjustedPositionsAndAcceptedOrdersNotionalSum.plus(value);
    }
  }

  const availableNotional = MAX_ADJUSTED_POSITION_SIZE_FOR_50X_OR_GREATER_ACCOUNTS.minus(adjustedPositionsAndAcceptedOrdersNotionalSum);

  let currentPosition = positions[contractCode] ? BigNumber(positions[contractCode].quantity) : BigNumber(0);

  if (isSpread)
    currentPosition = BigNumber.min(longPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded[seriesCode], shortPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded[seriesCode].abs());
  
  let positionLimitLong = availableNotional
    .dividedBy(tickerData[contractCode].indexPrice)
    .dividedBy(seriesSpecs[seriesCode].positionLimitAdjustment)
    .minus(longPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded[seriesCode])
    .minus(currentPosition)
  positionLimitLong = BigNumber.max(positionLimitLong, 0);

  let positionLimitShort = availableNotional
    .dividedBy(tickerData[contractCode].indexPrice)
    .dividedBy(seriesSpecs[seriesCode].positionLimitAdjustment)
    .minus(shortPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded[seriesCode].abs())
    .plus(currentPosition)
  positionLimitShort = BigNumber.max(positionLimitShort, 0);
  
  // console.log({location: 'getPositionLimit end', adjustedPositionsAndAcceptedOrdersNotionalSum: adjustedPositionsAndAcceptedOrdersNotionalSum.toString(), availableNotional: availableNotional.toString(), longPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded, shortPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded, currentPosition, index: tickerData[contractCode].indexPrice, positionAdjustment: seriesSpecs[seriesCode].positionLimitAdjustment, positionLimitLong: positionLimitLong.toString(), positionLimitShort: positionLimitShort.toString()});
  // console.log({adjustedPositionsAndAcceptedOrdersNotionalBySeries});
    
  return { positionLimitLong: positionLimitLong, positionLimitShort: positionLimitShort };
}


// pass a quantity to factory to remove that quantity from current order sizes
// (used in Modify Order form)
export const selectMaxBuySellFactory = thisQuantity =>
  createMarkedSelector(
    'selectMaxBuySell',
    selectFundsExcludingSeries, // requires prop: contractCode
    selectSeriesCodeFromContractCode,
    selectMaxLeverage,
    selectAdjustedPositionsAndAcceptedOrdersNotionalBySeries,
    selectPositionsData,
    selectTickerData,
    selectSeriesSpecs,
    selectLongPositionsWithAcceptedOrdersQuantityBySeriesCode,
    selectShortPositionsWithAcceptedOrdersQuantityBySeriesCode,
    selectMarginsReservedBySeriesExcluded,
    selectLongPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded,
    selectShortPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded,
    selectMarkPrice,
    selectDollarizer,
    selectContracts,
    selectPositionQuantity,
    selectActiveOrdersSizesOfContract,
    (_, contractCode) => contractCode,
    (funds, seriesCodeFromContractCode, maxLeverage, adjustedPositionsAndAcceptedOrdersNotionalBySeries, 
    positions, tickerData, seriesSpecs, longPositionsWithAcceptedOrdersQuantityBySeriesCode, shortPositionsWithAcceptedOrdersQuantityBySeriesCode,
    marginsReservedBySeriesExcluded,
    longPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded,
    shortPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded,
    markPrice, dollarizer, contractSpecs, quantity, activeOrderSizes, contractCode) => {
      if (!contractCode || !tickerData[contractCode]) {
        // console.log('no contractCode');

        return {
          quantity: {
            buy: BigNumber(0),
            sell: BigNumber(0),
          },          
          notional: {
            buy: BigNumber(0),
            sell: BigNumber(0),
          },
        };
      }
      const seriesCode = seriesCodeFromContractCode[contractCode];

      const isSpread = isSpreadContract(contractCode, contractSpecs);
      if (isSpread) {
        const individualContractCode = contractSpecs[contractCode].spreadContractCodeFront;
        markPrice = BigNumber(tickerData[individualContractCode].markPrice).abs()
      }

      // console.log('in selectMaxBuySellFactory');
      // console.log({marginsReservedBySeriesExcluded,
      //   longPositionsWithAcceptedOrdersQuantityBySeriesCode,
      //   shortPositionsWithAcceptedOrdersQuantityBySeriesCode,
      //   longPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded,
      //   shortPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded,
      //   markPrice, dollarizer, contractSpecs, quantity, activeOrderSizes});

      const { positionLimitLong, positionLimitShort } = getPositionLimit(seriesCode, contractCode, BigNumber(maxLeverage),
          adjustedPositionsAndAcceptedOrdersNotionalBySeries, positions, tickerData, seriesSpecs,
          longPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded, shortPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded, isSpread);  

      const seriesMarginMultiplier = seriesSpecs[seriesCode].seriesMarginMultiplier ?
        BigNumber(seriesSpecs[seriesCode].seriesMarginMultiplier) : BigNumber(1);

      let { maxPosLongFromFunds, maxPosShortFromFunds } = getMaxPositionForFunds(
        funds,
        maxLeverage,
        seriesMarginMultiplier,
        marginsReservedBySeriesExcluded[seriesCode].marginForLongs,
        marginsReservedBySeriesExcluded[seriesCode].marginForShorts,
        longPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded[seriesCode],
        shortPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded[seriesCode],
        markPrice,
        dollarizer
      );

      const netQuantity = longPositionsWithAcceptedOrdersQuantityBySeriesCode[seriesCode] ?
        longPositionsWithAcceptedOrdersQuantityBySeriesCode[seriesCode] :
        shortPositionsWithAcceptedOrdersQuantityBySeriesCode[seriesCode] ?
          shortPositionsWithAcceptedOrdersQuantityBySeriesCode[seriesCode] : BigNumber(0)

      maxPosLongFromFunds = maxPosLongFromFunds.minus(netQuantity);
      maxPosShortFromFunds = maxPosShortFromFunds.plus(netQuantity);

      const maxPosLong = positionLimitLong == null ?
        maxPosLongFromFunds : BigNumber.min(positionLimitLong, maxPosLongFromFunds);
      const maxPosShort = positionLimitShort == null ?
        maxPosShortFromFunds : BigNumber.min(positionLimitShort, maxPosShortFromFunds);

      // console.log({
      //   location: 'selectMaxBuySellFactory()',        
      //   maxLeverage: maxLeverage? maxLeverage.toString() : maxLeverage,
      //   positionLimitLong: positionLimitLong? positionLimitLong.toString(): positionLimitLong,
      //   positionLimitShort: positionLimitShort? positionLimitShort.toString(): positionLimitShort,
      //   maxPosLongFromFunds: maxPosLongFromFunds? maxPosLongFromFunds.toString() : maxPosLongFromFunds,
      //   maxPosShortFromFunds: maxPosShortFromFunds? maxPosShortFromFunds.toString(): maxPosShortFromFunds,
      //   maxPosLong: maxPosLong ? maxPosLong.toString() : maxPosLong,
      //   maxPosShort: maxPosShort ? maxPosShort.toString() : maxPosShort,
      // });

      // TODO(rogs): move spot max buy calculation here

      // TODO(rogs): round down using size decimals
      const maxVals = {
        quantity: {
          buy: maxPosLong.toNumber(),
          sell: maxPosShort.toNumber(),
        },
      };
      return {
        ...maxVals,
        // TODO(rogs): use the protection price rather than the mark price
        notional: {
          buy: maxVals.quantity.buy
            ? BigNumber(maxVals.quantity.buy)
                .multipliedBy(markPrice)
                .toNumber()
            : 0,
          sell: maxVals.quantity.sell
            ? BigNumber(maxVals.quantity.sell)
                .multipliedBy(markPrice)
                .toNumber()
            : 0,
        },
      };
    }
  );
