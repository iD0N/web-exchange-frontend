import BigNumber from 'bignumber.js';

import {
  ORDER_SIDE,
  ORDER_STOP_TRIGGER,
  ORDER_TYPE,
  PEG_PRICE_TYPE,
} from '../../../../common/enums';
import { toPriceString } from '../../../../common/utils/numberHelpers';
import { SIZE_TYPE } from '../order-entry/constants';

import { ORDER_ACTIONS_MAP } from './constants';

export const calcAveragePrice = ({ cost, sizeFilled }) => {
  const avg = BigNumber(cost).dividedBy(sizeFilled);

  return avg.isFinite() ? avg.absoluteValue().toNumber() : null;
};

export const ensureRequiredFields = (order, contracts) => ({
  ...order,
  orderType: order.orderType || order.type,
  createdAt: order.createdAt || order.timestamp,
  price:
    contracts && order.price && order.contractCode && contracts[order.contractCode]
      ? toPriceString(order.price, contracts[order.contractCode].priceDecimals)
      : order.price,
  averageFillPrice:
    contracts && order.averageFillPrice && order.contractCode && contracts[order.contractCode]
      ? toPriceString(order.averageFillPrice, contracts[order.contractCode].priceDecimals)
      : order.averageFillPrice || calcAveragePrice(order),
  quoteCurrency:
    contracts && contracts[order.contractCode]
      ? contracts[order.contractCode].quoteCurrency
      : undefined,
  stopPrice: !order.pegPriceType
    ? contracts && order.stopPrice && order.contractCode && contracts[order.contractCode]
      ? toPriceString(order.stopPrice, contracts[order.contractCode].priceDecimals)
      : order.stopPrice
    : undefined,
});

export const normalizeOrders = (orders, contracts) =>
  orders.map(order => ensureRequiredFields(order, contracts));

export const decideSide = fills =>
  fills.map(fill => ({
    ...fill,
    rowKey: `${fill.orderId}_${fill.timestamp}_${fill.quantity}`,
    side: BigNumber(fill.quantity).isPositive() ? ORDER_SIDE.BUY : ORDER_SIDE.SELL,
  }));

export const isValidAction = action => ORDER_ACTIONS_MAP[action];

export const truncateOrderId = orderId => orderId.slice(-7);

export const orderToFormValues = ({
  orderType,
  pegPriceType,
  pegOffsetValue,
  postOnly,
  price,
  reduceOnly,
  size,
  stopPrice,
  stopTrigger,
}) => ({
  notional: { value: undefined },
  orderType: { value: orderType },
  postOnly: { value: postOnly },
  price: { value: price },
  reduceOnly: { value: reduceOnly },
  size: { value: size },
  sizeType: { value: SIZE_TYPE.QUANTITY },
  stopOrderType: {
    value: !!pegPriceType
      ? pegPriceType === PEG_PRICE_TYPE.PERCENT
        ? ORDER_TYPE.STOP_MARKET_TRAILING_PCT
        : ORDER_TYPE.STOP_MARKET_TRAILING
      : orderType,
  },
  stopPrice: { value: stopPrice },
  stopTrigger: { value: stopTrigger || ORDER_STOP_TRIGGER.MARK },
  trailValue: {
    value: !!pegPriceType
      ? pegPriceType === PEG_PRICE_TYPE.PERCENT
        ? BigNumber(pegOffsetValue)
            .multipliedBy(100)
            .abs()
            .toNumber()
        : BigNumber(pegOffsetValue)
            .abs()
            .toNumber()
      : undefined,
  },
});

export const isStopOrderType = orderType =>
  [
    ORDER_TYPE.STOP_LIMIT,
    ORDER_TYPE.STOP_MARKET,
    ORDER_TYPE.STOP_MARKET_TRAILING,
    ORDER_TYPE.STOP_MARKET_TRAILING_PCT,
    ORDER_TYPE.TAKE_LIMIT,
    ORDER_TYPE.TAKE_MARKET,
  ].includes(orderType);

export const isTrailingStopMarket = orderType =>
  [ORDER_TYPE.STOP_MARKET_TRAILING, ORDER_TYPE.STOP_MARKET_TRAILING_PCT].includes(orderType);

export const isOfMarketOrderType = orderType =>
  [ORDER_TYPE.MARKET, ORDER_TYPE.STOP_MARKET, ORDER_TYPE.TAKE_MARKET].includes(orderType);

export const isOfLimitOrderType = orderType =>
  [ORDER_TYPE.LIMIT, ORDER_TYPE.STOP_LIMIT, ORDER_TYPE.TAKE_LIMIT].includes(orderType);

export const getPriceLevelKey = ({ orderType, price, stopPrice, side }) =>
  `${orderType}-${side}-${orderType === ORDER_TYPE.LIMIT ? price : stopPrice}`;

export const priceLevelData = order => ({
  levelKey: getPriceLevelKey(order),
  orders: [order],
  orderType: order.orderType,
  price: order.price,
  side: order.side,
  size: order.size,
  sizeFilled: order.sizeFilled,
  sizeRemaining: BigNumber(order.size)
    .minus(order.sizeFilled)
    .toString(),
});

export const generatePriceLevelTypeMap = orders =>
  orders.reduce((levels, order) => {
    const priceKey = order.orderType === ORDER_TYPE.LIMIT ? order.price : order.stopPrice;
    return {
      ...levels,
      [priceKey]:
        levels[priceKey] && levels[priceKey][order.orderType]
          ? {
              ...levels[priceKey],
              [order.orderType]: {
                ...priceLevelData(order),
                orders: [...levels[priceKey][order.orderType].orders, order],
                size: BigNumber(levels[priceKey][order.orderType].size)
                  .plus(order.size)
                  .toString(),
                sizeFilled: BigNumber(levels[priceKey][order.orderType].sizeFilled)
                  .plus(order.sizeFilled)
                  .toString(),
                sizeRemaining: BigNumber(levels[priceKey][order.orderType].size)
                  .plus(order.size)
                  .minus(
                    BigNumber(levels[priceKey][order.orderType].sizeFilled).plus(order.sizeFilled)
                  )
                  .toString(),
              },
            }
          : {
              ...(levels[priceKey] || {}),
              [order.orderType]: priceLevelData(order),
            },
    };
  }, {});
