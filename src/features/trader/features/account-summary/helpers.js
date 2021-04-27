import BigNumber from 'bignumber.js';

import { ORDER_SIDE } from '../../../../common/enums';
import { toPriceString } from '../../../../common/utils/numberHelpers';
import { returnPriceIfFinite } from '../positions/utils'; // TODO uplift

import { LEGEND_COLORS, ZERO_BALANCE_VALUE } from './constants';

export const pickNetLiquidityColor = ({
  liquidationLevel,
  netLiquidationValue,
  maintenanceMargin,
}) =>
  BigNumber(netLiquidationValue).isGreaterThan(maintenanceMargin)
    ? LEGEND_COLORS.ORANGE
    : BigNumber(netLiquidationValue).isLessThan(liquidationLevel)
    ? LEGEND_COLORS.DARK_RED
    : LEGEND_COLORS.RED;

export const addValueIfFinite = (startVal, addVal) =>
  BigNumber(addVal).isFinite() ? startVal.plus(addVal).dp(2) : startVal;

export const getMarginBarValues = ({
  netLiquidationValue,
  initialMargin,
  maintenanceMargin,
  initialMarginReserved,
  liquidationLevel,
  tokenBalances,
}) => ({
  showLiquidationBar: BigNumber(netLiquidationValue).isLessThan(initialMargin),
  initialMargin: BigNumber(initialMargin)
    .dividedBy(netLiquidationValue)
    .multipliedBy(100)
    .integerValue()
    .toNumber(),
  orderHolds: BigNumber(initialMarginReserved)
    .dividedBy(netLiquidationValue)
    .multipliedBy(100)
    .integerValue()
    .toNumber(),
  liquidationLevel: BigNumber(liquidationLevel)
    .dividedBy(initialMargin)
    .multipliedBy(100)
    .integerValue()
    .toNumber(),
  maintenanceMargin: BigNumber(maintenanceMargin)
    .dividedBy(initialMargin)
    .multipliedBy(100)
    .integerValue()
    .toNumber(),
  netLiquidationValue: BigNumber(initialMargin).isZero()
    ? 100
    : BigNumber(netLiquidationValue)
        .dividedBy(initialMargin)
        .multipliedBy(100)
        .integerValue()
        .toNumber(),
  netLiquidationColor: pickNetLiquidityColor({
    liquidationLevel,
    netLiquidationValue,
    maintenanceMargin,
  }),
  zeroBalance:
    Object.keys(tokenBalances).length === 0 ||
    BigNumber.sum
      .apply(
        null,
        Object.entries(tokenBalances).map(([key, val]) => val)
      )
      .isZero(),
});

export const aggregatePl = posMarked => {
  const initialValues = {
    dayPl: BigNumber(0),
    unrealizedPl: BigNumber(0),
    realizedPl: BigNumber(0),
    totalPl: BigNumber(0),
    totalMarketValue: BigNumber(0),
  };

  const positions = Object.values(posMarked);
  const marketValueMissing = positions.reduce(
    (missing, { marketValue }) => missing || Number.isNaN(marketValue),
    false
  );

  const bigNumberMap = positions.reduce(
    (plMap, position) => ({
      dayPl: addValueIfFinite(plMap.dayPl, position.dayPl),
      unrealizedPl: addValueIfFinite(plMap.unrealizedPl, position.unrealizedPl),
      realizedPl: addValueIfFinite(plMap.realizedPl, position.realizedPl),
      totalPl: addValueIfFinite(plMap.totalPl, position.totalPl),
      totalMarketValue: addValueIfFinite(plMap.totalMarketValue, position.marketValue || 0),
    }),
    initialValues
  );

  return Object.entries(bigNumberMap).reduce(
    (map, entry) => ({ ...map, [entry[0]]: returnPriceIfFinite(entry[1]) }),
    { dataReady: !marketValueMissing }
  );
};

export const generateLegendClass = color => `margin-bar-value-${color}`;

export const getNetLiquidationValue = (collateralValue, pl) =>
  BigNumber(collateralValue)
    .plus(pl.unrealizedPl)
    .toNumber();

export const normalizeAccountSummary = (
  tokenBalances,
  initialMarginReserved,
  pl,
  netLiquidationValue,
  netLiquidationValueWithoutHaircut,
  { initialMargin, maintenanceMargin, liquidationMargin: liquidationLevel },
  postionsLoaded,
  balanceDataLoaded,
  collateralTokens
) => {
  const marginBarValues = getMarginBarValues({
    netLiquidationValue,
    initialMargin,
    maintenanceMargin,
    initialMarginReserved,
    liquidationLevel,
    tokenBalances,
  });

  const collateralBalances = [[]];
  collateralTokens.forEach(({ tokenCode, decimalPlaces }) => {
    const balance = tokenBalances[tokenCode.toLowerCase()];
    if (
      tokenCode === 'BTC' ||
      (tokenBalances[tokenCode.toLowerCase()] &&
        !BigNumber(tokenBalances[tokenCode.toLowerCase()]).isZero())
    ) {
      collateralBalances[collateralBalances.length - 1].push({ balance, decimalPlaces, tokenCode });
      if (collateralBalances[collateralBalances.length - 1].length === 3) {
        collateralBalances.push([]);
        // add new row for next item insert
      }
    }
  });
  if (collateralBalances[collateralBalances.length - 1].length === 0) {
    // remove empty balance row
    collateralBalances.pop();
  }

  return {
    pl,
    balances: {
      collateralBalances,
      netLiquidationValue,
      initialMargin,
      maintenanceMargin,
      activeOrderHolds: BigNumber.max(0, BigNumber(initialMarginReserved).minus(initialMargin)).toString(),
      liquidationLevel,
      effectiveLeverage:
        BigNumber(pl.totalMarketValue).isZero() ||
        BigNumber(pl.totalMarketValue).isZero() ||
        BigNumber(netLiquidationValue).isNegative()
          ? NaN
          : BigNumber(pl.totalMarketValue)
              .dividedBy(netLiquidationValue)
              .toNumber(),
      buyingPower: BigNumber(netLiquidationValue)
        .minus(initialMarginReserved)
        .toNumber(),
      buyingPowerWithoutHaircut: BigNumber(netLiquidationValueWithoutHaircut)
        .minus(initialMarginReserved)
        .toNumber(),
    },
    marginBarValues: {
      ...marginBarValues,
      dataReady: pl.dataReady && postionsLoaded && balanceDataLoaded,
    },
  };
};

export const calcActiveOrderHolds = (orders, tickerData, initialMarginMap, positionsMap, excludingContract) => {
  if (!orders.length) {
    return ZERO_BALANCE_VALUE;
  }

  const positions = Object.entries(positionsMap).map(([contractCode, priceAndQuantity]) => ({
    contractCode,
    ...priceAndQuantity,
  }));

  const isActiveContract = ({ contractCode }) =>
    initialMarginMap[contractCode] && contractCode !== excludingContract;

  const exclusiveIMR = Object.keys(initialMarginMap)
    .filter(contractCode => isActiveContract({ contractCode }))
    .reduce(
      (sum, contractCode) =>
        sum.plus(
          BigNumber(initialMarginMap[contractCode].initialMargin)
            .times((positionsMap[contractCode] || {}).quantity || 0)
            .abs()
        ),
      BigNumber(0)
    );

  const positionQuantities = positions.filter(isActiveContract).reduce(
    (map, { quantity, contractCode, markPrice }) => ({
      ...map,
      [contractCode]: {
        position: BigNumber(quantity),
        markPrice: markPrice,
        initialMargin: initialMarginMap[contractCode].initialMargin,
        initialMarginPerContract: initialMarginMap[contractCode].initialMarginPerContract,
        initialMarginBase: initialMarginMap[contractCode].initialMarginBase,
      },
    }),
    {}
  );

  const activeOrders = orders
    .filter(isActiveContract)
    .reduce((map, { contractCode, side, size, sizeFilled }) => {
      if (!positionQuantities[contractCode]) {
        const { markPrice } = positionsMap[contractCode]
          || { markPrice: BigNumber(tickerData[contractCode] ? tickerData[contractCode].markPrice : 0) };
        positionQuantities[contractCode] = {
          position: BigNumber(0),
          markPrice,
          initialMargin: initialMarginMap[contractCode].initialMargin,
          initialMarginPerContract: initialMarginMap[contractCode].initialMarginPerContract,
          initialMarginBase: initialMarginMap[contractCode].initialMarginBase,
        };
      }
      const sizeRemaining = BigNumber(size).minus(sizeFilled);
      return map[contractCode]
        ? {
            ...map,
            [contractCode]: map[contractCode][side]
              ? { ...map[contractCode], [side]: map[contractCode][side].plus(sizeRemaining) }
              : { ...map[contractCode], [side]: sizeRemaining },
          }
        : { ...map, [contractCode]: { [side]: sizeRemaining } };
    }, {});

  const aggActiveOrderHolds = Object.entries(positionQuantities)
    .reduce(
      (
        activeOrderHolds,
        [
          contractCode,
          { markPrice, position, initialMargin, initialMarginPerContract, initialMarginBase },
        ]
      ) => {
        if (initialMarginBase === null || initialMarginPerContract === null) {
          return activeOrderHolds;
        }
        const buySide = position
          .plus(activeOrders[contractCode] ? activeOrders[contractCode][ORDER_SIDE.BUY] || 0 : 0)
          .abs();
        const sellSide = position
          .minus(activeOrders[contractCode] ? activeOrders[contractCode][ORDER_SIDE.SELL] || 0 : 0)
          .abs();
        const maxSide = BigNumber.maximum(buySide, sellSide);
        const initialMarginActual = BigNumber(initialMarginBase).plus(
          maxSide.multipliedBy(initialMarginPerContract)
        );
        const additional = initialMarginActual.multipliedBy(markPrice).multipliedBy(maxSide);
        return activeOrderHolds.plus(additional);
      },
      BigNumber(0)
    )
    .minus(exclusiveIMR);

  return aggActiveOrderHolds.isZero() ? ZERO_BALANCE_VALUE : toPriceString(aggActiveOrderHolds);
};

export function calcMargins(quantity, margins) {
  if (!margins || !BigNumber(quantity).isFinite()) {
    return {
      initialMargin: BigNumber(0),
      maintenanceMargin: BigNumber(0),
      liquidationMargin: BigNumber(0),
    };
  }

  const { initialMargin, maintenanceMargin, liquidationMargin } = margins;

  return {
    initialMargin: BigNumber(quantity)
      .times(initialMargin)
      .abs(),
    maintenanceMargin: BigNumber(quantity)
      .times(maintenanceMargin)
      .abs(),
    liquidationMargin: BigNumber(quantity)
      .times(liquidationMargin)
      .abs(),
  };
}

export function solveCubic(a, b, c, d) {
  // $FlowFixMe
  if (Math.abs(a) < 1e-8) { // Quadratic case, ax^2+bx+c=0
    // eslint-disable-next-line no-param-reassign
    a = b; b = c; c = d;
    // $FlowFixMe
    if (Math.abs(a) < 1e-8) { // Linear case, ax+b=0
      // eslint-disable-next-line no-param-reassign
      a = b; b = c;
      // $FlowFixMe
      if (Math.abs(a) < 1e-8) // Degenerate case
        return [];
      // $FlowFixMe
      return [-b / a];
    }

    // $FlowFixMe
    const D = b * b - 4 * a * c;
    if (Math.abs(D) < 1e-8)
      // $FlowFixMe
      return [-b / (2 * a)];
    // eslint-disable-next-line
    else if (D > 0)
      // $FlowFixMe
      return [(-b + Math.sqrt(D)) / (2 * a), (-b - Math.sqrt(D)) / (2 * a)];
    return [];
  }

  // Convert to depressed cubic t^3+pt+q = 0 (subst x = t - b/3a)
  // $FlowFixMe
  // const p = (3 * a * c - b * b) / (3 * a * a);
  const p = (a.times(c).times(3).minus(b.pow(2))).dividedBy(a.pow(2).times(3));
  // $FlowFixMe
  // const q = (2 * b * b * b - 9 * a * b * c + 27 * a * a * d) / (27 * a * a * a);
  const q = (b.pow(3).times(2).minus(a.times(b).times(c).times(9)).plus(a.pow(2).times(d).times(27))).dividedBy(a.pow(3).times(27))
  let roots;

  if (Math.abs(p) < 1e-8) { // p = 0 -> t^3 = -q -> t = -q^1/3
    roots = [Math.cbrt(-q)];
  } else if (Math.abs(q) < 1e-8) { // q = 0 -> t^3 + pt = 0 -> t(t^2+p)=0
    roots = [0].concat(p < 0 ? [Math.sqrt(-p), -Math.sqrt(-p)] : []);
  } else {
    // const D = q * q / 4 + p * p * p / 27;
    const D = BigNumber(q).times(q).dividedBy(4).plus(BigNumber(p).pow(3).dividedBy(27))
    if (Math.abs(D) < 1e-8) { // D = 0 -> two roots
      roots = [-1.5 * q / p, 3 * q / p];
    } else if (D > 0) { // Only one real root
      // const u = Math.cbrt(-q / 2 - Math.sqrt(D));
      const u = BigNumber(Math.cbrt(q.dividedBy(2).negated().minus(D.sqrt())));
      // console.log({location: 'solveCubic', p: p.toString(), q: q.toString(), D: D.toString(), u: u.toString()})
      roots = [u - p / (3 * u)];
    } else { // D < 0, three roots, but needs to use complex numbers/trigonometric solution
      const u = 2 * Math.sqrt(-p / 3);
      const t = Math.acos(3 * q / p / u) / 3; // D < 0 implies p < 0 and acos argument in [-1..1]
      const k = 2 * Math.PI / 3;
      roots = [u * Math.cos(t), u * Math.cos(t - k), u * Math.cos(t - 2 * k)];
    }
  }

  // Convert back from depressed cubic
  for (let i = 0; i < roots.length; i++)
    // $FlowFixMe
    roots[i] -= b / (3 * a);

  return roots;
}

export function getMaxPositionForFunds(
  funds,
  maxAccountLeverage,
  seriesMarginMultiplier,
  weightedPriceLongsExclusive,
  weightedPriceShortsExclusive,
  longPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded,
  shortPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded,
  markPrice,
  dollarizer
) {
  // console.log({location:'getMaxPositionForFunds', funds,
  //   maxAccountLeverage,
  //   seriesMarginMultiplier,
  //   weightedPriceLongsExclusive,
  //   weightedPriceShortsExclusive,
  //   longPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded,
  //   shortPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded,
  //   markPrice,
  //   dollarizer});

  if (funds.lte(0))
    return { maxPosLongFromFunds: BigNumber(0), maxPosShortFromFunds: BigNumber(0) };
  
  if (!markPrice || !dollarizer)
    return { maxPosLongFromFunds: BigNumber(0), maxPosShortFromFunds: BigNumber(0) };
  
  const dollarMarkPrice = BigNumber(markPrice).abs().times(dollarizer);

  // console.log({funds,
  // maxAccountLeverage,
  // seriesMarginMultiplier,
  // weightedPriceLongsExclusive,
  // weightedPriceShortsExclusive,
  // longPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded,
  // shortPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded,
  // markPrice,
  // dollarizer});

  let maxPosLong = (funds
    .times(maxAccountLeverage).minus(weightedPriceLongsExclusive))
    .dividedBy(dollarMarkPrice);

  let maxPosShort = (funds
    .times(maxAccountLeverage).minus(weightedPriceShortsExclusive))
    .dividedBy(dollarMarkPrice);

  const maxLongTooLarge = maxPosLong.gt((BigNumber(1).dividedBy(maxAccountLeverage)
    .dividedBy(seriesMarginMultiplier)).pow(2));
  const maxShortTooLarge = (maxPosShort.gt((BigNumber(1).dividedBy(maxAccountLeverage)
    .dividedBy(seriesMarginMultiplier)).pow(2)));

  // console.log({
  //   location: 'in traderUtils.getMaxPositionForFunds()',
  //   maxPosLong,
  //   maxPosShort,
  //   maxLongTooLarge,
  //   maxShortTooLarge,
  // });

  // console.log(JSON.stringify({
  //   location: 'iin traderUtils.getMaxPositionForFunds()',
  //   funds,
  //   maxAccountLeverage,
  //   seriesMarginMultiplier,
  //   weightedPriceLongsExclusive,
  //   weightedPriceShortsExclusive,
  //   longPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded,
  //   shortPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded,
  //   markPrice,
  //   dollarizer,
  // }));

  if (maxLongTooLarge || maxShortTooLarge) {
    const m = dollarMarkPrice;
    const mSquared = m.pow(2);
    const seriesMarginMultiplierSquared = seriesMarginMultiplier.pow(2);
    const fundsSquared = funds.pow(2);
    const weightedPriceLongsExclusiveSquared = weightedPriceLongsExclusive.pow(2);
    const weightedPriceShortsExclusiveSquared = weightedPriceShortsExclusive.pow(2);

    if (maxLongTooLarge) {
      const a = mSquared;
      const b = weightedPriceLongsExclusive.times(m).times(2)
        .plus(mSquared.times(longPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded));
      const c = weightedPriceLongsExclusive.times(longPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded).times(m)
        .times(2).plus(weightedPriceLongsExclusiveSquared);
      const d = weightedPriceLongsExclusiveSquared.times(longPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded)
        .minus(fundsSquared.dividedBy(seriesMarginMultiplierSquared));

      // console.log(JSON.stringify({m, mSquared, seriesMarginMultiplierSquared, 
      //   fundsSquared, weightedPriceLongsExclusiveSquared, weightedPriceShortsExclusiveSquared, a, b, c, d}))

      // Initial Margin Required = F
      // F = (W' + P * m)*(s * sqrt(P' + P))
      // F = funds available
      // W' = Weighted price of other positions of series * their mark price
      // m = markPriceDollarizer
      // s = seriesMarginMultiplier
      // P' = Sum of Positions (long or short) of same series, not including P
      // P = Max Position available for current contract
      const P = solveCubic(a, b, c, d);

      // console.log({location: 'solving maxLong', maxShortTooLarge, a, b, c, d, P});

      if (P.length === 0) {
        console.log(`Cannot calculate cubic for max long position size: ${
          JSON.stringify({
            funds,
            maxAccountLeverage,
            seriesMarginMultiplier,
            weightedPriceLongsExclusive,
            weightedPriceShortsExclusive,
            longPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded,
            shortPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded,
            markPrice,
            dollarizer,
          })}`);
      } else {
        maxPosLong = BigNumber(P[0]);
      }
    }

    if (maxShortTooLarge) {
      const a = mSquared;
      const b = weightedPriceShortsExclusive.times(m).times(2)
        .plus(mSquared.times(shortPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded));
      const c = weightedPriceShortsExclusive.times(shortPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded)
        .times(m).times(2).plus(weightedPriceShortsExclusiveSquared);
      const d = weightedPriceShortsExclusiveSquared.times(shortPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded)
        .minus(fundsSquared.dividedBy(seriesMarginMultiplierSquared));      

      const P = solveCubic(a, b, c, d);

      // console.log({location: 'solving maxShort', maxShortTooLarge, a, b, c, d, P})

      // console.log(JSON.stringify({m, mSquared, seriesMarginMultiplierSquared, 
      //   fundsSquared, weightedPriceLongsExclusiveSquared, weightedPriceShortsExclusiveSquared, a, b, c, d, P}))

      if (P.length === 0) {
        console.log(`Cannot calculate cubic for max short position size: ${
          JSON.stringify({
            funds,
            maxAccountLeverage,
            seriesMarginMultiplier,
            weightedPriceLongsExclusive,
            weightedPriceShortsExclusive,
            longPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded,
            shortPositionsWithAcceptedOrdersQuantityBySeriesCodeExcluded,
            markPrice,
            dollarizer,
          })}`);
      } else {
        maxPosShort = BigNumber(P[0]);
      }
    }
  }

  return { maxPosLongFromFunds: maxPosLong.dp(4), maxPosShortFromFunds: maxPosShort.dp(4) };
}