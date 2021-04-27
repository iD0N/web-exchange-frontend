import BigNumber from 'bignumber.js';

import { ORDER_SIDE, ORDER_TYPE } from '../../../../common/enums';
import { toPriceString, toQuantityString } from '../../../../common/utils/numberHelpers';
import {
  ensureRequiredFields,
  isOfLimitOrderType,
  isStopOrderType,
  isTrailingStopMarket,
} from '../orders/utils';

import { SIZE_TYPE } from './constants';

const BIG_SIZE = Infinity;

export const normalizeOrder = ({
  contractCode,
  notional,
  orderId,
  orderType,
  postOnly,
  price,
  priceDecimals,
  reduceOnly,
  sizeDecimals,
  size: inputSize,
  sizeType,
  stopOrderType,
  stopPrice,
  stopTrigger,
  trailValue,
  type,
  side,
}) => {
  const size =
    sizeType === SIZE_TYPE.QUANTITY || !sizeType
      ? inputSize
      : type === ORDER_TYPE.MARKET
      ? inputSize
      : BigNumber(notional)
          .dividedBy(price || stopPrice)
          .toNumber();

  const trailValueWithSign = !!trailValue
    ? side === ORDER_SIDE.SELL
      ? BigNumber(trailValue)
          .negated()
          .toNumber()
      : trailValue
    : undefined;
  const pegOffsetValue =
    trailValueWithSign && isStopOrderType(type) && isTrailingStopMarket(stopOrderType)
      ? stopOrderType === ORDER_TYPE.STOP_MARKET_TRAILING
        ? toPriceString(trailValueWithSign, priceDecimals)
        : BigNumber(trailValueWithSign)
            .dividedBy(100)
            .toString()
      : undefined;

  return ensureRequiredFields({
    orderId,
    contractCode,
    pegPriceType:
      isStopOrderType(type) && isTrailingStopMarket(stopOrderType)
        ? stopOrderType === ORDER_TYPE.STOP_MARKET_TRAILING
          ? 'TRAILING-STOP'
          : 'TRAILING-STOP-PCT'
        : undefined,
    pegOffsetValue,
    postOnly: !!postOnly,
    price: isOfLimitOrderType(type) ? toPriceString(price, priceDecimals) : undefined,
    reduceOnly: !!reduceOnly,
    side,
    size: toQuantityString(size, sizeDecimals),
    stopPrice:
      isStopOrderType(type) && !isTrailingStopMarket(stopOrderType)
        ? toPriceString(stopPrice, priceDecimals)
        : undefined,
    stopTrigger: isStopOrderType(type) ? stopTrigger : undefined,
    type,
  });
};

export const findCostBasisAuctionCrossAlgo = (size, levels) => {
  const [[firstPrice]] = levels;
  if (!size || !firstPrice || !levels.length) {
    return undefined;
  }

  let depthSizeSum = BigNumber(0);

  for (let i = 0, len = levels.length; i < len; i++) {
    const [levelPrice, levelSize] = levels[i];
    depthSizeSum = depthSizeSum.plus(levelSize);
    if (depthSizeSum.isGreaterThan(size)) {
      return BigNumber(size)
        .multipliedBy(levelPrice)
        .toNumber();
    }
  }

  return undefined;
};

export const findCostBasis = (size, levels) => {
  const [[firstPrice]] = levels;
  if (!size || !firstPrice) {
    return undefined;
  }

  let unspent = BigNumber(size);
  let cost = BigNumber(0);

  while (!unspent.isZero() && levels.length !== 0) {
    const [[levelPrice, levelSize]] = levels;
    const levelValue = BigNumber(levelPrice).multipliedBy(levelSize);

    if (BigNumber(levelSize).isGreaterThan(unspent)) {
      cost = cost.plus(unspent.multipliedBy(levelPrice));
      unspent = BigNumber(0);
    } else {
      cost = cost.plus(levelValue);
      unspent = unspent.minus(levelSize);
      levels.shift();
    }
  }

  return levels.length === 0 ? undefined : cost.toNumber();
};

export const findQuantityBasisAuctionCrossAlgo = (notional, levels) => {
  if (!notional || !levels.length) {
    return undefined;
  }

  let depthSizeSum = BigNumber(0);

  for (let i = 0, len = levels.length; i < len; i++) {
    const [levelPrice, levelSize] = levels[i];
    depthSizeSum = depthSizeSum.plus(levelSize);
    const levelNotionalTotal = BigNumber(levelPrice).multipliedBy(depthSizeSum);
    if (levelNotionalTotal.isGreaterThan(notional)) {
      return BigNumber(notional)
        .dividedBy(levelPrice)
        .toNumber();
    }
  }

  return undefined;
};

export const findQuantityBasis = (notional, levels) => {
  if (!notional) {
    return undefined;
  }

  let unspent = BigNumber(notional);
  let quantity = BigNumber(0);

  while (!unspent.isZero() && levels.length !== 0) {
    const [[price, size]] = levels;
    const levelValue = BigNumber(price).multipliedBy(size);
    if (levelValue.isGreaterThan(unspent)) {
      quantity = quantity.plus(unspent.dividedBy(price));
      unspent = BigNumber(0);
    } else {
      quantity = quantity.plus(size);
      unspent = unspent.minus(levelValue);
      levels.shift();
    }
  }

  return levels.length === 0 ? undefined : quantity.toNumber();
};

export const getCost = (price, size) =>
  BigNumber(price)
    .multipliedBy(size)
    .toNumber();

export const getQuantity = (notional, price) =>
  BigNumber(notional)
    .dividedBy(price)
    .toNumber();

export const transformDepth = (
  { bids, asks } = { bids: [[]], asks: [[]] },
  { priceBandThresholdMarket, priceDecimals }
) => {
  let askLevels = (asks && asks[0] && asks[0][0] ? [...asks] : [[]]).reverse();
  let bidLevels = bids && bids[0] && bids[0][0] ? [...bids] : [[]];
  const [[firstBidPrice]] = bidLevels;
  const [[firstAskPrice]] = askLevels;

  if (!firstAskPrice && !firstBidPrice) {
    return {
      bids: bidLevels,
      asks: askLevels,
    };
  }

  if (firstAskPrice || firstBidPrice) {
    const ceiling = BigNumber(firstAskPrice || firstBidPrice)
      .multipliedBy(BigNumber(1).plus(priceBandThresholdMarket))
      .dp(priceDecimals);
    askLevels = askLevels.map(level =>
      ceiling.isGreaterThan(level[0]) ? level : [ceiling, BIG_SIZE]
    );
    if (ceiling.isGreaterThan(askLevels[askLevels.length - 1][0])) {
      askLevels.push([ceiling, BIG_SIZE]);
    }
  }

  if (firstBidPrice || firstAskPrice) {
    const floor = BigNumber(firstBidPrice || firstAskPrice)
      .multipliedBy(BigNumber(1).minus(priceBandThresholdMarket))
      .dp(priceDecimals);
    bidLevels = bidLevels.map(level => (floor.isLessThan(level[0]) ? level : [floor, BIG_SIZE]));
    if (floor.isLessThan(bidLevels[bidLevels.length - 1][0])) {
      bidLevels.push([floor, BIG_SIZE]);
    }
  }

  return {
    bids: bidLevels,
    asks: askLevels,
  };
};

// round quantities toward zero below to be conservative (so suggested order
// sizes aren't rejected)
const toNum = (bn, decs) => bn.dp(decs, BigNumber.ROUND_DOWN).toNumber();

export const getQuantityEstimate = (contract, tickerDataForContract, notional) => {
  if (!notional) {
    return {
      canBuy: undefined,
      canSell: undefined,
    };
  }

  const { priceBandThresholdMarket, sizeDecimals } = contract;
  const { askPrice, bidPrice } = tickerDataForContract;

  const buyPrice = BigNumber(askPrice).times(BigNumber(1).plus(priceBandThresholdMarket));
  const sellPrice = BigNumber(bidPrice).times(BigNumber(1).minus(priceBandThresholdMarket));

  const canBuy = toNum(BigNumber(notional).div(buyPrice), sizeDecimals);
  const canSell = toNum(BigNumber(notional).div(sellPrice), sizeDecimals);

  return { canBuy, canSell };
};

const emptyCostEstimate = {
  canBuy: undefined,
  canSell: undefined,
  sizeExceedsAsks: false,
  sizeExceedsBids: false,
};

// when liquidation estimate is called, cost estimate results are always a new dict (but same values, all undefined)
// * why are they undefined?
// * why are they getting recomputed so many times anyway, are getCostEstimate's selector's inputs changing...?
export const getCostEstimate = (depth, globalContract, contractCode, size) => {
  if (!size || contractCode !== globalContract.contractCode) {
    return emptyCostEstimate;
  }
  const { bids, asks } = transformDepth(depth, globalContract);

  const sizeExceedsAsks = BigNumber.sum
    .apply(
      null,
      (depth.asks || []).map(([price, quantity]) => quantity)
    )
    .isLessThan(size);
  const sizeExceedsBids = BigNumber.sum
    .apply(
      null,
      (depth.bids || []).map(([price, quantity]) => quantity)
    )
    .isLessThan(size);

  return {
    canBuy: findCostBasisAuctionCrossAlgo(size, asks),
    canSell: findCostBasisAuctionCrossAlgo(size, bids),
    sizeExceedsAsks,
    sizeExceedsBids,
  };
};
