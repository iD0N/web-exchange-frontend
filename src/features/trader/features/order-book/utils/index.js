import BigNumber from 'bignumber.js';

import { ORDER_SIDE, ORDER_TYPE } from '../../../../../common/enums';
import { ZERO_SIZE_STRING } from '../../../constants';
import { ORDER_STATUS } from '../../orders/constants'; // TODO uplift
import { generatePriceLevelTypeMap } from '../../orders/utils';

import { LEVEL_SIDES, TOTAL_KEY } from './constants';
import {
  createPercentOf,
  normalizeAsks,
  normalizeBids,
  pickLevelPrice,
  aggPriceLevelAsk,
  aggPriceLevelBid,
} from './helpers';
import { aggregateAskLevels, aggregateBidLevels, generateSpreadLevels } from './adjustBook';
import normalizeDataForTradableTable from './normalizeDataForTradableTable';

const appendPercentOfMaxMapFn = percentOfMaxTotal => orderLevel => ({
  ...orderLevel,
  percentOfMax: {
    total: percentOfMaxTotal(orderLevel),
  },
});

export const applySizePercentage = (askLevels, bidLevels, spreadLevels = []) => {
  const percentOfMaxTotal = createPercentOf([...askLevels, ...bidLevels], TOTAL_KEY);

  return {
    asks: askLevels.map(appendPercentOfMaxMapFn(percentOfMaxTotal)),
    bids: bidLevels.map(appendPercentOfMaxMapFn(percentOfMaxTotal)),
    spread: spreadLevels,
  };
};

export const normalizeDataForOrderBookTable = (
  { asks, bids },
  myOrderSizes,
  aggregation,
  levelsPerSide,
  tradeEnabled,
  stickyPrice,
  priceDecimals
) => {
  if (tradeEnabled) {
    return normalizeDataForTradableTable(asks, bids, myOrderSizes, {
      aggregation,
      levelsPerSide,
      stickyPrice,
      priceDecimals,
    });
  }

  if (!asks.length || !bids.length || !priceDecimals) {
    return { asks: [], bids: [], spread: [] };
  }

  const aggregatedAsks = aggregateAskLevels(asks, {
    aggregation,
    levelsPerSide,
    priceDecimals,
    tradeEnabled,
  });
  const aggregatedBids = aggregateBidLevels(bids, {
    aggregation,
    levelsPerSide,
    priceDecimals,
    tradeEnabled,
  });

  return applySizePercentage(
    normalizeAsks(aggregatedAsks, myOrderSizes),
    normalizeBids(aggregatedBids, myOrderSizes)
  );
};

export const findMidMarket = ({
  asks = [],
  bids = [],
  aggregation,
  priceDecimals,
  levelsPerSide,
}) => {
  const aggregatedAsks = aggregateAskLevels(asks, { aggregation, levelsPerSide: 1, priceDecimals });
  const aggregatedBids = aggregateBidLevels(bids, { aggregation, levelsPerSide: 1, priceDecimals });
  const spreadLevels = generateSpreadLevels(
    aggregatedAsks,
    aggregatedBids,
    aggregation,
    priceDecimals,
    levelsPerSide
  );

  const levels = [...aggregatedAsks, ...spreadLevels, ...aggregatedBids];

  if (!levels.length) {
    return ZERO_SIZE_STRING;
  }

  const midIndex = BigNumber(levels.length)
    .dividedToIntegerBy(2)
    .toNumber();

  return aggPriceLevelBid(pickLevelPrice(levels[midIndex]), aggregation, priceDecimals);
};

export const generateMySizeMap = (orders, aggregation, priceDecimals, tradeEnabled) => {
  const applicableOrders = tradeEnabled
    ? orders.filter(
        ({ status, orderType }) =>
          status === ORDER_STATUS.ACCEPTED && orderType !== ORDER_TYPE.MARKET
      )
    : orders.filter(
        ({ status, orderType }) =>
          status === ORDER_STATUS.ACCEPTED && orderType === ORDER_TYPE.LIMIT
      );
  const ordersWithAggregatedPrice = applicableOrders.map(order => {
    const aggPrice =
      order.side === (order.orderType === ORDER_TYPE.STOP_MARKET ? ORDER_SIDE.BUY : ORDER_SIDE.SELL)
        ? aggPriceLevelAsk(order.price, aggregation, priceDecimals)
        : aggPriceLevelBid(order.price, aggregation, priceDecimals);

    return { ...order, price: aggPrice };
  });

  return Object.entries(generatePriceLevelTypeMap(ordersWithAggregatedPrice)).reduce(
    (level, [price, orderTypes]) => ({
      ...level,
      [price]: Object.entries(orderTypes).reduce(
        (priceMap, [type, data]) => ({
          ...priceMap,
          [type]: BigNumber(data.sizeRemaining).toNumber(),
        }),
        {}
      ),
    }),
    {}
  );
};

export const getOrderSide = (orderType, levelSide) =>
  orderType === ORDER_TYPE.STOP_MARKET
    ? levelSide === LEVEL_SIDES.ASK
      ? ORDER_SIDE.BUY
      : ORDER_SIDE.SELL
    : levelSide === LEVEL_SIDES.ASK
    ? ORDER_SIDE.SELL
    : ORDER_SIDE.BUY;
