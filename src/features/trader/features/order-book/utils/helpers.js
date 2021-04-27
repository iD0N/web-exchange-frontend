import maxBy from 'lodash.maxby';
import BigNumber from 'bignumber.js';

import { toPriceString } from '../../../../../common/utils/numberHelpers';
import { ZERO_SIZE_STRING } from '../../../constants';
import { GRID_LAYOUT_ROW_HEIGHT } from '../../../layout-manager/constants';
import { LEVEL_INDICES, UPDATE_TYPE_INDEX, LEVEL_SIDES, HEIGHT } from './constants';

export const pickLevelPriceInt = level => level[LEVEL_INDICES.PRICE_INT];
export const pickLevelPrice = level => level[LEVEL_INDICES.PRICE];
export const pickLevelSize = level => level[LEVEL_INDICES.SIZE];

export const appendPriceInt = level => [...level, BigNumber(pickLevelPrice(level)).toNumber()];

export const sortHighToLowByPrice = (a, b) => pickLevelPriceInt(b) - pickLevelPriceInt(a);

export const appendPriceIntAndSort = ({ bids, asks }) => ({
  bids: bids.map(appendPriceInt).sort(sortHighToLowByPrice),
  asks: asks.map(appendPriceInt).sort(sortHighToLowByPrice),
});

export const createLevelFromPrice = (priceString, size = ZERO_SIZE_STRING) =>
  appendPriceInt([priceString, size]);

export const convertChangesToLevels = (changes, type) =>
  changes.reduce((levels, change) => {
    return change[UPDATE_TYPE_INDEX] === type
      ? levels.concat([appendPriceInt(change.slice(1))])
      : levels;
  }, []);

export const calcMax = (orders, column) => orders.length && maxBy(orders, column)[column];

export const percentOfMax = (value, maxValue) =>
  value
    ? BigNumber(value)
        .dividedBy(maxValue)
        .multipliedBy(100)
        .integerValue()
        .toNumber()
    : 0;

export const createPercentOf = (levels, key) => {
  const max = calcMax(levels, key);

  return level => percentOfMax(level[key], max);
};

const normalizeWithSide = (side, mySizesMap, reduceMethod, reducerAppendWrapper) => {
  let rollingTotal = BigNumber(0),
    rollingTotalNotional = BigNumber(0);

  return reduceMethod((returnArr, level) => {
    rollingTotal = rollingTotal.plus(pickLevelSize(level));
    rollingTotalNotional = rollingTotalNotional.plus(
      BigNumber(pickLevelSize(level)).multipliedBy(pickLevelPriceInt(level))
    );
    const sizeByType = mySizesMap[pickLevelPrice(level)] || {};

    reducerAppendWrapper(returnArr, {
      total: rollingTotal.toNumber(),
      totalNotional: rollingTotalNotional.toNumber(),
      size: pickLevelSize(level),
      price: pickLevelPrice(level),
      rowKey: `${level[0]}-${side}`,
      mySize: mySizesMap[pickLevelPrice(level)]
        ? BigNumber.sum(...Object.values(sizeByType)).toNumber()
        : 0,
      sizeByType,
      side,
    });
    return returnArr;
  });
};

export const normalizeAsks = (levels, mySizesMap) => {
  return normalizeWithSide(
    LEVEL_SIDES.ASK,
    mySizesMap,
    reduceFunction => levels.reduceRight(reduceFunction, []),
    (returnArr, obj) => returnArr.unshift(obj)
  );
};

export const normalizeBids = (levels, mySizesMap) => {
  return normalizeWithSide(
    LEVEL_SIDES.BID,
    mySizesMap,
    reduceFunction => levels.reduce(reduceFunction, []),
    (returnArr, obj) => returnArr.push(obj)
  );
};

export const normalizeSpread = (levels, mySizesMap) => {
  return normalizeWithSide(
    LEVEL_SIDES.SPREAD,
    mySizesMap,
    reduceFunction => levels.reduce(reduceFunction, []),
    (returnArr, obj) => returnArr.push(obj)
  );
};

const aggregatePriceLevels = roundMethod => (price, aggregation, priceDecimals) =>
  toPriceString(
    BigNumber(
      roundMethod(
        BigNumber(price)
          .dividedBy(aggregation)
          .toNumber()
      )
    ).multipliedBy(aggregation),
    priceDecimals
  );

export const aggPriceLevelBid = aggregatePriceLevels(Math.floor);

export const aggPriceLevelAsk = aggregatePriceLevels(Math.ceil);

const createGenerateLevels = ({ sumFn, reduceFn }) => (
  firstLevelPrice,
  count,
  aggregation,
  priceDecimals,
  sizeFn
) => {
  if (!count || isNaN(count) || count < 0) {
    return [];
  }
  return reduceFn(Array(count).fill(), (arr, value, index) => {
    const levelPrice = sumFn(
      BigNumber(firstLevelPrice),
      BigNumber(index).multipliedBy(aggregation)
    );
    return levelPrice.isPositive()
      ? [
          ...arr,
          createLevelFromPrice(toPriceString(levelPrice, priceDecimals), sizeFn ? sizeFn(0) : 0),
        ]
      : arr;
  });
};

export const generateLevelsDescending = createGenerateLevels({
  sumFn: (a, b) => BigNumber(a).minus(BigNumber(b)),
  reduceFn: (levels, reduceFunction) => levels.reduce(reduceFunction, []),
});

export const generateLevelsAscending = createGenerateLevels({
  sumFn: (a, b) => BigNumber(a).plus(BigNumber(b)),
  reduceFn: (levels, reduceFunction) => levels.reduceRight(reduceFunction, []),
});

export const bucketExistingBids = ({ bids, aggregation, levels, priceDecimals }) => {
  const levelPrices = {};
  let lastPrice;
  const buckets = bids.reduce((buckets, level, index, arr) => {
    if (Object.keys(levelPrices).length === levels) {
      arr.splice(1);
      return buckets;
    }
    const price = aggPriceLevelBid(pickLevelPriceInt(level), aggregation, priceDecimals);
    if (lastPrice !== price) {
      lastPrice = price;
      levelPrices[price] = true;
      return [...buckets, createLevelFromPrice(toPriceString(price, priceDecimals), BigNumber(0))];
    }
    return buckets;
  }, []);

  const delta = levels - Object.keys(levelPrices).length;

  if (!delta) {
    return buckets;
  }

  const nextLevel = BigNumber(lastPrice)
    .minus(aggregation)
    .toNumber();
  const remainingZeroLevels = generateLevelsDescending(
    nextLevel,
    delta,
    aggregation,
    priceDecimals,
    size => BigNumber(size)
  );
  return [...buckets, ...remainingZeroLevels];
};

export const bucketExistingAsks = ({ asks, aggregation, levels, priceDecimals }) => {
  const levelPrices = {};
  let lastPrice;
  const buckets = asks.reduceRight((buckets, level, index, arr) => {
    if (Object.keys(levelPrices).length === levels) {
      arr.splice(1);
      return buckets;
    }
    const price = aggPriceLevelAsk(pickLevelPriceInt(level), aggregation, priceDecimals);
    if (lastPrice !== price) {
      lastPrice = price;
      levelPrices[price] = true;
      return [createLevelFromPrice(toPriceString(price, priceDecimals), BigNumber(0)), ...buckets];
    }
    return buckets;
  }, []);

  const delta = levels - Object.keys(levelPrices).length;

  if (!delta) {
    return buckets;
  }

  const nextLevel = BigNumber(lastPrice)
    .plus(aggregation)
    .toNumber();
  const remainingZeroLevels = generateLevelsAscending(
    nextLevel,
    delta,
    aggregation,
    priceDecimals,
    size => BigNumber(size)
  );
  return [...remainingZeroLevels, ...buckets];
};

// TODO refactor, we should get the available height from DOM instead of counting it ourselfs
export const levelsHeightAvailable = (widgetHeight, tradeEnabled) => {
  const { HEADER, FOOTER, PADDING, TABLE_HEADER, MIDDLE_ROW, TRADABLE_TOOLS } = HEIGHT;
  return BigNumber(widgetHeight)
    .multipliedBy(GRID_LAYOUT_ROW_HEIGHT)
    .minus(HEADER)
    .minus(FOOTER)
    .minus(PADDING)
    .minus(TABLE_HEADER)
    .minus(tradeEnabled ? TRADABLE_TOOLS : MIDDLE_ROW);
};
