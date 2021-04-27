import BigNumber from 'bignumber.js';

import {
  normalizeAsks,
  normalizeBids,
  normalizeSpread,
  pickLevelPriceInt,
  aggPriceLevelAsk,
  aggPriceLevelBid,
  generateLevelsAscending,
} from './helpers';
import {
  aggregateAskLevels,
  aggregateBidLevels,
  generateSpreadLevels,
  eliminateSpreadZerosAsks,
  eliminateSpreadZerosBids,
} from './adjustBook';
import { applySizePercentage } from './';

const returnBidsOnly = (
  bids,
  highestBidAggPriceLevel,
  topLevelPrice,
  bottomLevelPrice,
  aggregation,
  myOrderSizes,
  priceDecimals
) => {
  const bidsToRender = BigNumber(highestBidAggPriceLevel)
    .minus(bottomLevelPrice)
    .dividedToIntegerBy(aggregation)
    .plus(1)
    .toNumber();

  const cutoff = BigNumber(highestBidAggPriceLevel)
    .minus(topLevelPrice)
    .dividedToIntegerBy(aggregation)
    .toNumber();

  const aggregatedBids = aggregateBidLevels(bids, {
    aggregation,
    levelsPerSide: bidsToRender,
    priceDecimals,
  }).slice(cutoff);

  return applySizePercentage(
    normalizeAsks([], myOrderSizes),
    normalizeBids(aggregatedBids, myOrderSizes),
    normalizeSpread([], myOrderSizes)
  );
};

const returnAsksOnly = (
  asks,
  lowestAskAggPriceLevel,
  topLevelPrice,
  totalLevelsToRender,
  aggregation,
  myOrderSizes,
  priceDecimals
) => {
  const asksToRender = topLevelPrice
    .minus(lowestAskAggPriceLevel)
    .dividedToIntegerBy(aggregation)
    .plus(1)
    .toNumber();

  const aggregatedAsks = aggregateAskLevels(asks, {
    aggregation,
    levelsPerSide: asksToRender,
    priceDecimals,
  }).slice(0, totalLevelsToRender);

  return applySizePercentage(
    normalizeAsks(aggregatedAsks, myOrderSizes),
    normalizeBids([], myOrderSizes),
    normalizeSpread([], myOrderSizes)
  );
};

const returnSpreadOnly = (
  bottomLevelPrice,
  totalLevelsToRender,
  aggregation,
  myOrderSizes,
  priceDecimals
) => {
  const spreadLevels = generateLevelsAscending(
    bottomLevelPrice,
    totalLevelsToRender,
    aggregation,
    priceDecimals
  );

  return applySizePercentage(
    normalizeAsks([], myOrderSizes),
    normalizeBids([], myOrderSizes),
    normalizeSpread(spreadLevels, myOrderSizes)
  );
};

const returnSpreadAndBids = (
  totalLevelsToRender,
  aggregatedBids,
  aggregation,
  myOrderSizes,
  priceDecimals
) => {
  const [firstBid] = aggregatedBids;

  const spreadLevels = generateLevelsAscending(
    BigNumber(pickLevelPriceInt(firstBid))
      .plus(aggregation)
      .toNumber(),
    totalLevelsToRender - aggregatedBids.length,
    aggregation,
    priceDecimals
  );

  return applySizePercentage(
    normalizeAsks([], myOrderSizes),
    normalizeBids(aggregatedBids, myOrderSizes),
    normalizeSpread(spreadLevels, myOrderSizes)
  );
};

const returnSpreadAndAsks = (
  bottomLevelPrice,
  totalLevelsToRender,
  aggregatedAsks,
  aggregation,
  myOrderSizes,
  priceDecimals
) => {
  const spreadLevels = generateLevelsAscending(
    bottomLevelPrice,
    totalLevelsToRender - aggregatedAsks.length,
    aggregation,
    priceDecimals
  );

  return applySizePercentage(
    normalizeAsks(aggregatedAsks, myOrderSizes),
    normalizeBids([], myOrderSizes),
    normalizeSpread(spreadLevels, myOrderSizes)
  );
};

const calcTotalLevels = levelsPerSide =>
  BigNumber(levelsPerSide)
    .multipliedBy(2)
    .toNumber();

const calcTopLevelPrice = (stickyPrice, aggregation, levelsPerSide) =>
  BigNumber(stickyPrice).plus(BigNumber(aggregation).multipliedBy(levelsPerSide));

const calcBottomLevelPrice = (stickyPrice, aggregation, levelsPerSide) =>
  BigNumber(stickyPrice).minus(
    BigNumber(aggregation).multipliedBy(BigNumber(levelsPerSide).minus(1))
  );

const calcRenderableAskCount = (topLevelPrice, lowestAskAggPriceLevel, aggregation) =>
  topLevelPrice.isGreaterThanOrEqualTo(lowestAskAggPriceLevel)
    ? topLevelPrice
        .minus(lowestAskAggPriceLevel)
        .dividedToIntegerBy(aggregation)
        .plus(1)
        .toNumber()
    : 0;

const calcRenderableBidCount = (bottomLevelPrice, highestBidAggPriceLevel, aggregation) =>
  bottomLevelPrice.isLessThanOrEqualTo(highestBidAggPriceLevel)
    ? BigNumber(highestBidAggPriceLevel)
        .minus(bottomLevelPrice)
        .dividedToIntegerBy(aggregation)
        .plus(1)
        .toNumber()
    : 0;

export default function normalizeDataForTradableTable(
  asksWithZeroSize,
  bidsWithZeroSize,
  myOrderSizes,
  { aggregation, levelsPerSide, stickyPrice, priceDecimals }
) {
  const asks = eliminateSpreadZerosAsks(asksWithZeroSize);
  const bids = eliminateSpreadZerosBids(bidsWithZeroSize);

  const totalLevelsToRender = calcTotalLevels(levelsPerSide);

  let topLevelPrice = calcTopLevelPrice(stickyPrice, aggregation, levelsPerSide);
  let bottomLevelPrice = calcBottomLevelPrice(stickyPrice, aggregation, levelsPerSide);

  if (bottomLevelPrice.isNegative()) {
    topLevelPrice = topLevelPrice.plus(bottomLevelPrice.absoluteValue());
    bottomLevelPrice = BigNumber(0);
  }

  const [lowestAsk] = asks.slice(-1);
  const [highestBid] = bids;

  const lowestAskAggPriceLevel = lowestAsk
    ? aggPriceLevelAsk(pickLevelPriceInt(lowestAsk), aggregation, priceDecimals)
    : Infinity;

  const highestBidAggPriceLevel = highestBid
    ? aggPriceLevelBid(pickLevelPriceInt(highestBid), aggregation, priceDecimals)
    : -Infinity;

  // return only bids
  if (BigNumber(highestBidAggPriceLevel).isGreaterThanOrEqualTo(topLevelPrice)) {
    return returnBidsOnly(
      bids,
      highestBidAggPriceLevel,
      topLevelPrice,
      bottomLevelPrice,
      aggregation,
      myOrderSizes,
      priceDecimals
    );
  }

  // return only asks
  if (BigNumber(lowestAskAggPriceLevel).isLessThanOrEqualTo(bottomLevelPrice)) {
    return returnAsksOnly(
      asks,
      lowestAskAggPriceLevel,
      topLevelPrice,
      totalLevelsToRender,
      aggregation,
      myOrderSizes,
      priceDecimals
    );
  }

  const asksToRender = calcRenderableAskCount(topLevelPrice, lowestAskAggPriceLevel, aggregation);

  const bidsToRender = calcRenderableBidCount(
    bottomLevelPrice,
    highestBidAggPriceLevel,
    aggregation
  );

  // return only spread
  if (!asksToRender && !bidsToRender) {
    return returnSpreadOnly(
      bottomLevelPrice,
      totalLevelsToRender,
      aggregation,
      myOrderSizes,
      priceDecimals
    );
  }

  const aggregatedAsks = aggregateAskLevels(asks, {
    aggregation,
    levelsPerSide: asksToRender,
    priceDecimals,
  });

  const aggregatedBids = aggregateBidLevels(bids, {
    aggregation,
    levelsPerSide: bidsToRender,
    priceDecimals,
  });

  // return spread and bids
  if (!asksToRender) {
    return returnSpreadAndBids(
      totalLevelsToRender,
      aggregatedBids,
      aggregation,
      myOrderSizes,
      priceDecimals
    );
  }

  // return spread and asks
  if (!bidsToRender) {
    return returnSpreadAndAsks(
      bottomLevelPrice,
      totalLevelsToRender,
      aggregatedAsks,
      aggregation,
      myOrderSizes,
      priceDecimals
    );
  }

  // asks, bids, and (maybe) spread will be presented

  const spreadLevels = generateSpreadLevels(
    aggregatedAsks,
    aggregatedBids,
    aggregation,
    priceDecimals,
    levelsPerSide
  );

  return applySizePercentage(
    normalizeAsks(aggregatedAsks, myOrderSizes),
    normalizeBids(aggregatedBids, myOrderSizes),
    normalizeSpread(spreadLevels, myOrderSizes)
  );
}
