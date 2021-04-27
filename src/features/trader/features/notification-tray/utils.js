import BigNumber from 'bignumber.js';
import numbro from 'numbro';

import { toQuantityString, toPriceString } from '../../../../common/utils/numberHelpers';
import { t } from '../../../../common/services/i18n';
import { ORDER_SIDE, ORDER_TYPE } from '../../../../common/enums';

const MESSAGE = {
  ORDER_REJECT_INVALID_POST_ONLY: 'trader.notifications.order.rejected.message.invalidPostOnly',
  ORDER_REJECT_MAINTENANCE: 'trader.notifications.order.rejected.message.maintenance',
  ORDER_REJECT_SELF_TRADE: 'trader.notifications.order.rejected.message.selfTrade',
  ORDER_REJECT_INVALID_CLOSE_ONLY: 'trader.notifications.order.rejected.message.invalidReduceOnly',
  ORDER_REJECT_MAX_ORDERS: 'trader.notifications.order.rejected.message.maxOrders',
  ORDER_REJECT_LIMIT_PRICE_PROTECTION_VIOLATION:
    'trader.notifications.order.rejected.message.limitPriceProtection',
  ORDER_REJECT_FUNDS_LIMIT_ZERO: 'trader.notifications.order.rejected.message.fundsLimitZero',
  ORDER_REJECT_FUNDS_LIMIT: 'trader.notifications.order.rejected.message.fundsLimit',
  ORDER_REJECT_POSITION_LIMIT_SINGLE:
    'trader.notifications.order.rejected.message.positionLimitSingle',
  ORDER_REJECT_POSITION_LIMIT_COMBINED:
    'trader.notifications.order.rejected.message.positionLimitCombined',
};

const calcAverageFillPrice = (cost, sizeFilled, priceDecimals) => {
  const sizeFilledFloat = parseFloat(sizeFilled);
  return sizeFilledFloat
    ? toPriceString(Math.abs(parseFloat(cost)) / sizeFilledFloat, priceDecimals)
    : undefined;
};

const getNotificationForOrderMessage = (data, contracts) => {
  const {
    action,
    details,
    details: {
      contractCode,
      fillPrice,
      message,
      messageCode,
      modified,
      quantityFilled,
      orderId: longOrderId,
      price,
      side: orderSide,
      size,
      sizeFilled,
      type,
      cost,
    },
  } = data;

  let localizedStrings = {};
  const orderId = longOrderId.substr(-7);
  const priceDecimals =
    contracts &&
    contractCode &&
    contracts[contractCode] &&
    contracts[contractCode].priceDecimals &&
    BigNumber(contracts[contractCode].priceDecimals).isFinite()
      ? contracts[contractCode].priceDecimals
      : 2;
  const sizeDecimals =
    contracts &&
    contractCode &&
    contracts[contractCode] &&
    contracts[contractCode].sizeDecimals &&
    BigNumber(contracts[contractCode].sizeDecimals).isFinite()
      ? contracts[contractCode].sizeDecimals
      : 4;
  const typeStr =
    {
      [ORDER_TYPE.LIMIT]: t('trader.orderEntry.limit', { defaultValue: 'limit' }).toLowerCase(),
      [ORDER_TYPE.MARKET]: t('trader.orderEntry.market', { defaultValue: 'market' }).toLowerCase(),
      [ORDER_TYPE.STOP_MARKET]: t('trader.orderEntry.stopMarket', {
        defaultValue: 'stop market',
      }).toLowerCase(),
      [ORDER_TYPE.TAKE_MARKET]: t('trader.orderEntry.stopMarket', {
        defaultValue: 'take market',
      }).toLowerCase(),
      [ORDER_TYPE.STOP_LIMIT]: t('trader.orderEntry.stopLimit', {
        defaultValue: 'stop limit',
      }).toLowerCase(),
      [ORDER_TYPE.TAKE_LIMIT]: t('trader.orderEntry.takeLimit', {
        defaultValue: 'take limit',
      }).toLowerCase(),
    }[type] || type;

  let side = orderSide;
  if (details.quantity) {
    side = BigNumber(details.quantity).isPositive() ? ORDER_SIDE.BUY : ORDER_SIDE.SELL;
    details.quantity = Math.abs(details.quantity);
    if (!details.size) {
      details.size = details.quantity;
    }
    details.side = side;
  }

  const buyOrSell = t(
    side === ORDER_SIDE.BUY ? 'trader.orderEntry.buy' : 'trader.orderEntry.sell'
  ).toLowerCase();

  const formattedNumbers = addFormattedNumbers({ details, priceDecimals, sizeDecimals });
  const priceStr =
    price && type !== 'market'
      ? t('trader.notifications.order.accepted.withPrice', {
          price: toPriceString(price, priceDecimals),
          ...formattedNumbers,
          defaultValue: ` with limit ${toPriceString(price, priceDecimals)}`,
        })
      : '';

  if (action === 'accepted') {
    const actionStr = modified
      ? t('trader.notifications.order.modified.action', { defaultValue: 'modified' })
      : t('trader.notifications.order.accepted.action', { defaultValue: 'accepted' });
    if (modified) {
      localizedStrings = {
        body: t('trader.notifications.order.modified.body', {
          orderId,
          typeStr,
          buyOrSell,
          size,
          contractCode,
          priceStr,
          ...formattedNumbers,
          defaultValue: `Order ${orderId} has been modified. It is now a ${typeStr} order to ${buyOrSell} ${size} contracts of ${contractCode}${priceStr}.`,
        }),
        subject: t('trader.notifications.order.modified.subject', {
          defaultValue: `Order modified`,
        }),
      };
    } else {
      localizedStrings = {
        body: t('trader.notifications.order.accepted.body', {
          typeStr,
          buyOrSell,
          size,
          contractCode,
          priceStr,
          action,
          ...formattedNumbers,
          defaultValue: `Your ${typeStr} order to ${buyOrSell} ${size} contracts of ${contractCode}${priceStr} has been ${actionStr}.`,
        }),
        subject: t('trader.notifications.order.accepted.subject', {
          defaultValue: `Order accepted`,
        }),
      };
    }
  } else if (action === 'rejected') {
    localizedStrings = {
      subject: t('trader.notifications.order.rejected.subject', { defaultValue: 'Order rejected' }),
      body: MESSAGE[messageCode]
        ? t(MESSAGE[messageCode], { ...details, ...formattedNumbers, orderId })
        : message,
    };
  } else if (action === 'modify-rejected') {
    localizedStrings = {
      subject: t('trader.notifications.order.modifyRejected.subject', {
        defaultValue: 'Modify rejected',
      }),
      body: MESSAGE[messageCode]
        ? t(MESSAGE[messageCode], { ...details, ...formattedNumbers, orderId })
        : message,
    };
  } else if (action === 'canceled') {
    localizedStrings = {
      body: t('trader.notifications.order.canceled.body', {
        orderId,
        buyOrSell,
        size,
        contractCode,
        priceStr,
        ...formattedNumbers,
        defaultValue: `Order ${orderId} has been canceled.`,
      }),
      subject: t('trader.notifications.order.canceled.subject', { defaultValue: 'Order canceled' }),
    };
  } else if (action === 'cancel-rejected') {
    localizedStrings = {
      subject: t('trader.notifications.order.cancelRejected.subject', {
        defaultValue: 'Cancel rejected',
      }),
      body: MESSAGE[messageCode]
        ? t(MESSAGE[messageCode], { ...details, ...formattedNumbers, orderId })
        : message,
    };
  } else if (action === 'filled' && size === sizeFilled) {
    let avgFillPrice = calcAverageFillPrice(cost, sizeFilled, priceDecimals);
    avgFillPrice = numbro(avgFillPrice).format({
      mantissa: priceDecimals,
      thousandSeparated: true,
    });
    localizedStrings = {
      subject: t('trader.notifications.order.filled.subject', { defaultValue: 'Order filled' }),
      body: t('trader.notifications.order.filled.body', {
        orderId,
        buyOrSell,
        size,
        contractCode,
        priceStr,
        avgFillPrice,
        ...formattedNumbers,
        defaultValue: `Order ${orderId} has been filled at ${avgFillPrice}.`,
      }),
    };
  } else if (action === 'filled') {
    let delta = BigNumber(quantityFilled)
      .abs()
      .toNumber();
    delta = numbro(delta).format({ thousandSeparated: true, mantissa: sizeDecimals });
    let remaining = toQuantityString(BigNumber(size).minus(BigNumber(sizeFilled)));
    remaining = numbro(remaining).format({ thousandSeparated: true, mantissa: sizeDecimals });
    localizedStrings = {
      subject: t('trader.notifications.order.filledPartial.subject', {
        defaultValue: 'Order partially filled',
      }),
      body: t('trader.notifications.order.filledPartial.body', {
        delta,
        orderId,
        fillPrice: toPriceString(fillPrice, priceDecimals),
        buyOrSell,
        size,
        contractCode,
        priceStr,
        remaining,
        ...formattedNumbers,
        defaultValue: `${delta} contracts of order ${orderId} have been filled at ${toPriceString(
          fillPrice,
          priceDecimals
        )} (${remaining} contracts remaining).`,
      }),
    };
  } else if (action === 'triggered') {
    localizedStrings = {
      subject: t('trader.notifications.order.triggered.subject', {
        defaultValue: 'Order triggered',
      }),
      body: t('trader.notifications.order.triggered.body', {
        orderId,
        buyOrSell,
        size,
        contractCode,
        ...formattedNumbers,
        defaultValue: `Order ${orderId} to ${buyOrSell} ${size} contracts of ${contractCode} has triggered and will be included in the next auction.`,
      }),
    };
  }
  return { ...data, ...localizedStrings };
};

const getNotificationForTransferMessage = data => {
  const {
    action,
    details: { transferId, tokenCode, delta },
  } = data;

  let localizedStrings = {};
  if (action === 'complete') {
    const transferShortId = transferId.substr(-7);
    const amount = BigNumber(delta)
      .abs()
      .toString();
    const transferType = t(
      BigNumber(delta).gt(0)
        ? 'settings.history.transactionType.deposit'
        : 'settings.history.transactionType.withdrawal'
    );
    const transferTypeLower = transferType.toLowerCase();
    localizedStrings = {
      subject: t('trader.notifications.transfer.complete.subject', {
        defaultValue: `${transferType} Complete (${transferShortId})`,
      }),
      body: t('trader.notifications.transfer.complete.body', {
        amount,
        tokenCode: tokenCode.toUpperCase(),
        transferType: transferTypeLower,
        defaultValue: `Your ${transferTypeLower} of ${amount} ${tokenCode.toUpperCase()} is complete.`,
      }),
    };
  }
  return { ...data, ...localizedStrings };
};

const getNotificationForAccountStateMessage = data => {
  const {
    action,
    details: { state },
  } = data;

  let localizedStrings = {};
  if (state === 'liquidating') {
    if (action === 'create') {
      localizedStrings = {
        subject: t('trader.notifications.state.liquidation.subject', {
          defaultValue: 'Account liquidation',
        }),
        body: t('trader.notifications.state.liquidation.body', {
          defaultValue:
            'Your total collateral has fallen below the liquidation level. Your positions will be liquidated immediately.',
        }),
      };
    } else if (action === 'delete') {
      localizedStrings = {
        subject: t('trader.notifications.state.complete.subject', {
          defaultValue: 'Account liquidation complete',
        }),
        body: t('trader.notifications.state.complete.body', {
          defaultValue:
            'Liquidation of your positions is complete. Your existing orders have been canceled, but you may now insert new orders.',
        }),
      };
    }
  }
  return { ...data, ...localizedStrings };
};

const addFormattedNumbers = ({ details, priceDecimals, sizeDecimals }) => {
  const overrides = {};
  ['sizeFilled', 'quantity', 'size', 'maxSize'].forEach(key => {
    if (BigNumber(details[key]).isFinite()) {
      overrides[key] = numbro(details[key]).format({
        thousandSeparated: true,
        mantissa: sizeDecimals,
      });
    }
  });
  ['price', 'cost'].forEach(key => {
    if (BigNumber(details[key]).isFinite()) {
      overrides[key] = numbro(details[key]).format({
        thousandSeparated: true,
        mantissa: priceDecimals,
      });
    }
  });
  return overrides;
};

export const localizeNotification = (data, contracts) => {
  if (data.notificationType === 'order') {
    return getNotificationForOrderMessage(data, contracts);
  } else if (data.notificationType === 'transfer') {
    return getNotificationForTransferMessage(data);
  } else if (data.notificationType === 'trader-state') {
    return getNotificationForAccountStateMessage(data);
  }

  return data;
};
