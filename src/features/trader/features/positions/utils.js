import BigNumber from 'bignumber.js';
import moment from 'moment';

import { Monitor } from '@acdxio/common';

import { convertDictValsToBigNumber, toPriceString } from '../../../../common/utils/numberHelpers';

const calculateUnrealizedPl = (averageEntryPrice, markPrice, quantity, dollarizer = 1) =>
  BigNumber(markPrice)
    .minus(BigNumber(averageEntryPrice).isFinite() ? averageEntryPrice : markPrice)
    .multipliedBy(quantity)
    .multipliedBy(dollarizer);

const calculateRealizedPl = dayRealizedPl => BigNumber(dayRealizedPl);

const calculateTotalPl = (unrealizedPl, dayRealizedPl) =>
  BigNumber(unrealizedPl).plus(dayRealizedPl);

const calculateDayPl = function(
  dayRelativeRealizedPl,
  dayRelativeAverageEntryPrice,
  markPrice,
  quantity,
  dollarizer
) {
  const dayRelativeUnrealizedPl = calculateUnrealizedPl(
    dayRelativeAverageEntryPrice,
    markPrice,
    quantity,
    dollarizer
  );
  return dayRelativeUnrealizedPl.plus(dayRelativeRealizedPl);
};

const isOpenPosition = quantity => BigNumber(quantity).isFinite() && !BigNumber(quantity).isZero();

export const returnPriceIfFinite = bigNumberObj =>
  bigNumberObj.isFinite() ? bigNumberObj.toNumber() : undefined;

export const calculatePl = function(
  {
    quantity,
    averageEntryPrice,
    dayClosedPl: dayRealizedPl,
    dayRelativeAverageEntryPrice,
    dayRelativeClosedPl, // dayRelativeRealizedPl
    dayRelativeToDate,
  },
  markPrice,
  dollarizer = 1
) {
  if (!markPrice) {
    return {};
  }

  let dayRelativeRealizedPl = dayRelativeClosedPl;

  const now = moment.utc().format('YYYY-MM-DD');
  const isRelativeToday = dayRelativeToDate === now;
  if (!isRelativeToday) {
    // if we haven't received a position update during this UTC day, reset the day-relative stats
    dayRelativeRealizedPl = 0;
    dayRelativeAverageEntryPrice = markPrice;
    dayRelativeToDate = now;
  }

  const unrealizedPl = calculateUnrealizedPl(averageEntryPrice, markPrice, quantity, dollarizer);
  const realizedPl = calculateRealizedPl(dayRealizedPl);

  const plObject = {
    unrealizedPl,
    totalPl: calculateTotalPl(unrealizedPl, realizedPl),
    dayPl: isRelativeToday
      ? calculateDayPl(
          dayRelativeRealizedPl,
          dayRelativeAverageEntryPrice,
          markPrice,
          quantity,
          dollarizer
        )
      : BigNumber(0),
    realizedPl,
  };

  return Object.keys(plObject).reduce(
    (map, key) => ({ ...map, [key]: returnPriceIfFinite(plObject[key]) }),
    { markPrice }
  );
};

export const normalizePosition = (position, contract = { priceDecimals: 8 }, dollarizer = 1) => ({
  ...position,
  averageEntryPrice:
    toPriceString(position.averageEntryPrice, contract.priceDecimals || 8) || undefined,
  quantity: position.quantity || undefined,
  hasPosition: isOpenPosition(position.quantity),
  markPrice: position.markPrice
    ? toPriceString(position.markPrice, contract.priceDecimals)
    : undefined,
  marketValue:
    contract.underlying !== 'USD'
      ? BigNumber(position.markPrice)
          .multipliedBy(BigNumber(position.quantity))
          .multipliedBy(BigNumber(contract.multiplier || 1))
          .multipliedBy(dollarizer || 1)
          .abs()
          .toNumber()
      : BigNumber(position.quantity || 0)
          .abs()
          .toNumber(),
  priceDecimals: contract.priceDecimals,
  sizeDecimals: contract.sizeDecimals,
  dollarizer,
});

export const getLiquidationPricesWithPositions = (
  posQuantityMarkPrice,
  nlv,
  contracts,
  tokenBalances,
  collateralTokens
) => {
  if (Object.keys(posQuantityMarkPrice).length === 0) {
    return {};
  }
  const priceDecimalsMap = {};
  const positionQuantityMap = {};
  const positions = Object.values(posQuantityMarkPrice).map(position => {
    const contractMetadata = contracts[position.contractCode] || {};
    priceDecimalsMap[position.contractCode] = contractMetadata.priceDecimals;
    positionQuantityMap[position.contractCode] = position.quantity || 0;
    return {
      ...position,
      marginDetails: convertDictValsToBigNumber(contractMetadata, [
        'initialMarginBase',
        'initialMarginPerContract',
        'liquidationInitialRatio',
      ]),
      quantity: BigNumber(position.quantity || 0),
      markPrice: BigNumber(position.markPrice),
      dollarizer: BigNumber(position.dollarizer),
      minimumPriceIncrement: BigNumber(contractMetadata.minimumPriceIncrement),
    };
  });

  const liquidationMargins = Object.entries(contracts)
    .filter(([key, { liquidationMargin }]) => liquidationMargin !== 'NaN')
    .map(([key, { liquidationMargin }]) =>
      BigNumber(positionQuantityMap[key] || 0)
        .abs()
        .multipliedBy(liquidationMargin)
    );
  const liquidationMarginRequired = BigNumber.sum.apply(null, liquidationMargins);

  const liquidationPriceByContract = Monitor.getLiquidationPriceByContract(
    positions,
    Object.entries(tokenBalances).reduce(
      (map, [tokenCode, value]) => ({ ...map, [tokenCode.toUpperCase()]: BigNumber(value) }),
      {}
    ),
    BigNumber(nlv),
    liquidationMarginRequired,
    new Set(collateralTokens.map(({ tokenCode }) => tokenCode))
  );

  return Object.entries(liquidationPriceByContract).reduce(
    (map, [contractCode, val]) => ({
      ...map,
      [contractCode]: BigNumber(val)
        .dp(priceDecimalsMap[contractCode] || 2)
        .toNumber(),
    }),
    {}
  );
};
