import BigNumber from 'bignumber.js';

import { findRightIndexAtCondition } from '../../../../../common/utils/helpers';
import { toPriceString, toQuantityString } from '../../../../../common/utils/numberHelpers';
import { ZERO_SIZE_STRING } from '../../../constants';

import { PRICE_LEVEL_TICK, LEVEL_INDICES } from './constants';
import {
  bucketExistingAsks,
  bucketExistingBids,
  pickLevelPrice,
  pickLevelPriceInt,
  pickLevelSize,
  createLevelFromPrice,
  aggPriceLevelBid,
  aggPriceLevelAsk,
  generateLevelsDescending,
  generateLevelsAscending,
} from './helpers';

export const adjustBidsForAskMismatch = (bids, lowestAskPrice, { priceDecimals }) => {
  return bids;
  // If highest bid price level exceeds lowest ask level, remove overlapping bids
  /*
  if (lowestAskPrice === 0) {
    return bids;
  }
  let adjustedBids = bids;
  const [firstBid] = adjustedBids;
  if (firstBid && pickLevelPriceInt(firstBid) >= lowestAskPrice) {
    const firstValidBidIndex = adjustedBids.findIndex(
      bid => pickLevelPriceInt(bid) <= lowestAskPrice
    );
    if (firstValidBidIndex >= 0) {
      // remove all bids that are greater than or equal to size of lowest ask
      adjustedBids.splice(0, firstValidBidIndex + 1);
    } else {
      // all bids are on higher price level than lowest-priced ask
      const maxBidPrice = toPriceString(lowestAskPrice - PRICE_LEVEL_TICK, priceDecimals);
      adjustedBids = [createLevelFromPrice(maxBidPrice)];
    }
  }
  return adjustedBids;
  */
};

export const handleMissingLevelEdgeCases = ({ bids, asks }, priceDecimals) => {
  // Makes sure that the order book displays either no data, or
  // at least 1 ask and 1 bid even when one of either does not exist
  const [firstBid] = bids;
  const [lastAsk] = asks.slice(-1);
  const hasBids = firstBid && pickLevelSize(firstBid) !== ZERO_SIZE_STRING;
  const hasAsks = lastAsk && pickLevelSize(lastAsk) !== ZERO_SIZE_STRING;
  const lowestAskPrice = hasAsks ? pickLevelPriceInt(lastAsk) : 0;

  if (hasBids && hasAsks) {
    return { bids: adjustBidsForAskMismatch(bids, lowestAskPrice, { priceDecimals }), asks };
  }

  if (hasBids && !hasAsks) {
    const lowestPossibleAskPrice = toPriceString(
      pickLevelPriceInt(firstBid) + PRICE_LEVEL_TICK,
      priceDecimals
    );
    return { bids, asks: [createLevelFromPrice(lowestPossibleAskPrice)] };
  }

  if (!hasBids && hasAsks) {
    const maxPossibleBidPrice = toPriceString(lowestAskPrice - PRICE_LEVEL_TICK, priceDecimals);
    return { bids: [createLevelFromPrice(maxPossibleBidPrice)], asks };
  }

  if (!hasBids && !hasAsks) {
    return { bids, asks };
  }
};

export const applyZeroSizeRules = (data, { priceDecimals }) =>
  handleMissingLevelEdgeCases(eliminateSpreadZeros(data), priceDecimals);

export const aggregateBidLevels = (
  bids,
  { aggregation, levelsPerSide, priceDecimals, tradeEnabled = true }
) => {
  const stack = tradeEnabled
    ? [...bids]
    : bids.filter(bid => !BigNumber(pickLevelSize(bid)).isZero());
  const [firstBid] = bids;

  if (!firstBid) {
    return [];
  }

  const firstLevel = BigNumber(
    aggPriceLevelBid(pickLevelPriceInt(firstBid), aggregation, priceDecimals)
  );

  const aggLevels =
    tradeEnabled || stack.length === 0
      ? generateLevelsDescending(firstLevel, levelsPerSide, aggregation, priceDecimals, size =>
          BigNumber(size)
        )
      : bucketExistingBids({ bids: [...stack], aggregation, levels: levelsPerSide, priceDecimals });

  const result = [];

  while (aggLevels.length && stack.length) {
    const [aggLevel] = aggLevels;

    while (stack.length) {
      const [level] = stack;
      const levelSize = pickLevelSize(level);
      const levelPriceAgg = aggPriceLevelBid(pickLevelPriceInt(level), aggregation, priceDecimals);

      if (levelPriceAgg === pickLevelPrice(aggLevel)) {
        aggLevel[LEVEL_INDICES.SIZE] = aggLevel[LEVEL_INDICES.SIZE].plus(levelSize);
        stack.shift();
      } else if (!tradeEnabled && levelPriceAgg > pickLevelPriceInt(aggLevel)) {
        stack.shift();
      } else {
        result.push(aggLevels.shift());
        break;
      }
    }
  }
  return [...result, ...aggLevels].map(bid => [
    bid[LEVEL_INDICES.PRICE],
    bid[LEVEL_INDICES.SIZE].isZero()
      ? ZERO_SIZE_STRING
      : toQuantityString(bid[LEVEL_INDICES.SIZE], 4),
    bid[LEVEL_INDICES.PRICE_INT],
  ]);
};

export const aggregateAskLevels = (
  asks,
  { aggregation, levelsPerSide, priceDecimals, tradeEnabled = true }
) => {
  const stack = tradeEnabled
    ? [...asks]
    : asks.filter(ask => !BigNumber(pickLevelSize(ask)).isZero());
  const [firstAsk] = asks.slice(-1);

  if (!firstAsk) {
    return [];
  }

  const firstLevel = BigNumber(
    aggPriceLevelAsk(pickLevelPriceInt(firstAsk), aggregation, priceDecimals)
  );

  const aggLevels =
    tradeEnabled || stack.length === 0
      ? generateLevelsAscending(firstLevel, levelsPerSide, aggregation, priceDecimals, size =>
          BigNumber(size)
        )
      : bucketExistingAsks({ asks: [...stack], aggregation, levels: levelsPerSide, priceDecimals });

  const result = [];
  while (aggLevels.length && stack.length) {
    const [aggLevel] = aggLevels.slice(-1);

    while (stack.length) {
      const [level] = stack.slice(-1);
      const levelSize = pickLevelSize(level);
      const levelPriceAgg = aggPriceLevelAsk(pickLevelPriceInt(level), aggregation, priceDecimals);
      if (levelPriceAgg === pickLevelPrice(aggLevel)) {
        aggLevel[LEVEL_INDICES.SIZE] = aggLevel[LEVEL_INDICES.SIZE].plus(levelSize);
        stack.pop();
      } else if (!tradeEnabled && levelPriceAgg < pickLevelPriceInt(aggLevel)) {
        stack.pop();
      } else {
        result.unshift(aggLevel);
        aggLevels.pop();
        break;
      }
    }
  }
  return [...aggLevels, ...result].map(ask => [
    ask[LEVEL_INDICES.PRICE],
    ask[LEVEL_INDICES.SIZE].isZero()
      ? ZERO_SIZE_STRING
      : toQuantityString(ask[LEVEL_INDICES.SIZE], 4),
    ask[LEVEL_INDICES.PRICE_INT],
  ]);
};

export const eliminateSpreadZerosAsks = asks => {
  const lastNonZeroSizeIndex = findRightIndexAtCondition(
    ask => pickLevelSize(ask) !== ZERO_SIZE_STRING
  )(asks);

  if (lastNonZeroSizeIndex === -1) {
    return [];
  }

  asks.splice(lastNonZeroSizeIndex + 1);
  return asks;
};

export const eliminateSpreadZerosBids = bids => {
  const firstNonZeroSizeIndex = bids.findIndex(bid => pickLevelSize(bid) !== ZERO_SIZE_STRING);

  if (firstNonZeroSizeIndex === -1) {
    return [];
  }

  bids.splice(0, firstNonZeroSizeIndex);
  return bids;
};

// Eliminate 0-size levels at the spread (between asks and bids).
// This must happen here rather than in rendering because the same
// price levels may end up populating both asks and bids and bloat
// data with 0-size levels as the market price changes
export const eliminateSpreadZeros = ({ bids, asks }) => ({
  bids: eliminateSpreadZerosBids(bids),
  asks: eliminateSpreadZerosAsks(asks),
});

export const generateSpreadLevels = (
  aggregatedAsks,
  aggregatedBids,
  aggregation,
  priceDecimals,
  levelsPerSide
) => {
  const [lowestAsk] = aggregatedAsks.slice(-1);
  const [highestBid] = aggregatedBids;

  if (!lowestAsk || !highestBid) {
    return [];
  }

  const maxVisible = BigNumber(levelsPerSide)
    .multipliedBy(2)
    .toNumber();

  const delta = BigNumber(pickLevelPriceInt(lowestAsk))
    .minus(pickLevelPriceInt(highestBid))
    .minus(aggregation);

  if (delta.isZero()) {
    return [];
  }

  const firstLevel = BigNumber(pickLevelPriceInt(lowestAsk)).minus(aggregation);
  const levelsToInsert = delta.dividedBy(aggregation).toNumber();

  if (levelsToInsert > maxVisible) {
    const levelsDelta = BigNumber(levelsToInsert)
      .minus(maxVisible)
      .dividedBy(2)
      .dp(0);
    const topVisibleLevel = aggPriceLevelAsk(
      BigNumber(pickLevelPriceInt(lowestAsk))
        .minus(levelsDelta.multipliedBy(aggregation))
        .toNumber(),
      aggregation,
      priceDecimals
    );

    const midPrice = aggPriceLevelBid(topVisibleLevel, aggregation, priceDecimals);

    return generateLevelsDescending(
      BigNumber(midPrice).plus(
        BigNumber(maxVisible)
          .dividedBy(2)
          .dp(0)
          .multipliedBy(aggregation)
      ),
      maxVisible,
      aggregation,
      priceDecimals
    );
  }

  return generateLevelsDescending(firstLevel, levelsToInsert, aggregation, priceDecimals);
};
