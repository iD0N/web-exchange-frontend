import React from 'react';
import { Trans } from 'react-i18next';
import BigNumber from 'bignumber.js';
import Icon from 'antd/lib/icon';
import cn from 'classnames';

import { t } from '../../../../../common/services/i18n';
import { ORDER_SIDE, ORDER_TYPE, PEG_PRICE_TYPE } from '../../../../../common/enums';
import {
  Currency,
  InfoTooltip,
  Table,
  Timezone,
  Tooltip,
  Value,
} from '../../../../../common/components/trader';
import { ORDER_STOP_TRIGGER_LABEL } from '../../../components/order/constants';

import { ORDER_STATUS } from '../constants';
import { isStopOrderType, truncateOrderId } from '../utils';
import CancelOrderButton from './CancelOrderButton';
import ModifyOrderButton from './ModifyOrderButton';

const { DescriptionHeader, sortableColumns } = Table;

export const Age = ({ width = 70, ...bag } = {}) =>
  sortableColumns.age({
    align: 'left',
    dataIndex: 'createdAt',
    render: (value, order) =>
      order.status !== ORDER_STATUS.CANCELED ? (
        <Tooltip title={<Value.Date type="datetime" value={value || order.timestamp} />}>
          <Value.Duration value={value || order.timestamp} />
        </Tooltip>
      ) : null,
    title: <Trans i18nKey="trader.orders.columns.age">Age</Trans>,
    width,
    ...bag,
  });

export const AverageFillPrice = ({ width = 120 } = {}) =>
  sortableColumns.number({
    align: 'right',
    dataIndex: 'averageFillPrice',
    render: (value, { priceDecimals }) =>
      value && (
        <Value.Numeric
          autoDecimals={!priceDecimals}
          decimals={priceDecimals}
          type="currency"
          noPrefix
          value={value}
        />
      ),
    title: (
      <DescriptionHeader>
        <Trans i18nKey="trader.orders.columns.avgFillPrice">Avg Fill Price</Trans>
      </DescriptionHeader>
    ),
    width,
  });

export const OpenOrderActions = ({ cancelOrder, logCancel, logModify, width = 50 } = {}) => ({
  align: 'center',
  alwaysVisible: true,
  dataIndex: 'orderId',
  key: 'actions',
  render: (orderId, order) => (
    <span className="trader-table-actions">
      {!!order.status && (
        <CancelOrderButton
          orderId={orderId}
          status={order.status}
          order={order}
          logCancel={logCancel}
          onCancel={cancelOrder}
        />
      )}
      {order.orderType !== ORDER_TYPE.MARKET && (
        <ModifyOrderButton logModifyInitiate={logModify} order={order} />
      )}
    </span>
  ),
  width,
});

export const Contract = ({ width = 100, sortable = true } = {}) => {
  const column = {
    dataIndex: 'contractCode',
    title: <Trans i18nKey="trader.orders.columns.contract">Contract</Trans>,
    width,
  };

  return sortable ? sortableColumns.string(column) : column;
};

export const Trigger = ({ condensed = false, width = 100, sortable = false } = {}) => {
  const column = {
    dataIndex: 'stopTrigger',
    title: <Trans i18nKey="trader.orderEntry.stopTrigger.title">Trigger</Trans>,
    render: value => (
      <span className="lowercase">
        {condensed
          ? t(ORDER_STOP_TRIGGER_LABEL[value]).split(' ')[0]
          : t(ORDER_STOP_TRIGGER_LABEL[value])}
      </span>
    ),
    width,
  };

  return sortable ? sortableColumns.string(column) : column;
};

export const OrderDate = ({ width = 250 } = {}) =>
  sortableColumns.date({
    align: 'left',
    dataIndex: 'createdAt',
    render: (value, order) => <Value.Date type="datetime" value={value} />,
    title: (
      <DescriptionHeader>
        <InfoTooltip
          title={
            <Trans i18nKey="trader.orders.columns.dateTooltip">
              'The time at which the order was submitted.'
            </Trans>
          }
        >
          <>
            <Trans i18nKey="trader.orders.columns.date">Date</Trans>
            <Timezone />
          </>
        </InfoTooltip>
      </DescriptionHeader>
    ),
    width,
  });

export const OrderId = ({ width = 80 } = {}) => ({
  align: 'left',
  dataIndex: 'orderId',
  title: <Trans i18nKey="trader.orders.columns.orderId">Order ID</Trans>,
  render: (value, { origin }) =>
    origin === 'liquidation' ? 'Liquidation' : value && truncateOrderId(value),
  width,
});

export const Price = ({
  inline,
  orderType,
  sortable = true,
  width = 120,
  title,
  dataIndex = 'price',
  isTriggerPrice,
  showNA,
  priceDecimals,
} = {}) => {
  const column = {
    align: 'right',
    dataIndex,
    render: (value, { feeType, orderType, priceDecimals: decimals }) =>
      !showNA
        ? (orderType !== ORDER_TYPE.MARKET || !!feeType) && (
            <Value.Numeric type="price" decimals={decimals || priceDecimals} value={value} />
          )
        : 'N/A',
    title: title || (
      <DescriptionHeader>
        {isTriggerPrice ? (
          <Trans i18nKey="trader.orders.columns.triggerPrice">Trigger Price</Trans>
        ) : isStopOrderType(orderType) ? (
          orderType === ORDER_TYPE.STOP_MARKET ? (
            <Trans i18nKey="trader.orders.columns.stopPrice">Stop Price</Trans>
          ) : (
            <Trans i18nKey="trader.orders.columns.takeProfitPrice">Take Profit Price</Trans>
          )
        ) : (
          <Trans i18nKey="trader.orders.columns.price">Price</Trans>
        )}
      </DescriptionHeader>
    ),
    width,
  };

  return sortable ? sortableColumns.number(column) : column;
};

export const TrailValue = ({
  dataIndex = 'pegOffsetValue',
  decimals,
  sortable,
  title,
  width = 120,
} = {}) => {
  const column = {
    align: 'right',
    dataIndex,
    render: (value, { pegPriceType, priceDecimals, quoteCurrency }) =>
      !!pegPriceType && (
        <>
          <Value.Numeric
            type={pegPriceType === PEG_PRICE_TYPE.PERCENT ? 'percentage' : 'price'}
            decimals={pegPriceType === PEG_PRICE_TYPE.PERCENT ? 4 : decimals || priceDecimals}
            value={BigNumber(value)
              .abs()
              .toNumber()}
          />
          {pegPriceType !== PEG_PRICE_TYPE.PERCENT && <Currency value={quoteCurrency} inline />}
        </>
      ),
    title: title || (
      <DescriptionHeader>
        <Trans i18nKey="trader.orderEntry.trailValue.title">Trigger Price</Trans>
      </DescriptionHeader>
    ),
    width,
  };

  return sortable ? sortableColumns.number(column) : column;
};

export const Fee = ({ width = 70, title, dataIndex = 'fee', showNA } = {}) =>
  sortableColumns.number({
    align: 'right',
    dataIndex,
    render: value =>
      !showNA ? (
        <Value.Numeric
          type="fee"
          withDirection
          noPrefix
          value={BigNumber(value)
            .negated()
            .toNumber()}
        />
      ) : (
        'N/A'
      ),
    title: title || (
      <DescriptionHeader>
        <Trans i18nKey="trader.orders.columns.fee">Fee</Trans>
      </DescriptionHeader>
    ),
    width,
  });

export const Fees = ({ width = 80 } = {}) =>
  sortableColumns.number({
    align: 'right',
    dataIndex: 'fillFees',
    render: value => (
      <Value.Numeric
        withDirection
        type="fee"
        noPrefix
        value={BigNumber(value)
          .negated()
          .toNumber()}
      />
    ),
    title: (
      <DescriptionHeader>
        <Trans i18nKey="trader.orders.columns.fillFees">Fees</Trans>
      </DescriptionHeader>
    ),
    width,
  });

export const FeeCurrency = ({ width = 80, dataIndex = 'feeCurrency' } = {}) => {
  // console.log('FeeCurrency', { sortableColumns });
  return sortableColumns.number({
    align: 'left',
    dataIndex,
    render: value => (<Currency value={value} parens={false} />),
    title: (
      <DescriptionHeader>
        <Trans i18nKey="trader.orders.columns.feeCurrency">Fee Currency</Trans>
      </DescriptionHeader>
    ),
    width,
  });
}

export const ReduceOnly = ({ rightAlign, width = 100 } = {}) => ({
  align: rightAlign ? 'right' : undefined,
  dataIndex: 'reduceOnly',
  title: <Trans i18nKey="trader.orders.columns.reduceOnly">Reduce-only</Trans>,
  render: value =>
    !!value && (
      <div className={!rightAlign ? 'text-center' : undefined}>
        <Icon type="check" />
      </div>
    ),
  width,
});

export const PostOnly = ({ rightAlign, width = 100 } = {}) => ({
  align: rightAlign ? 'right' : undefined,
  dataIndex: 'postOnly',
  title: <Trans i18nKey="trader.orders.columns.postOnly">Post-only</Trans>,
  render: value =>
    !!value && (
      <div className={!rightAlign ? 'text-center' : undefined}>
        <Icon type="check" />
      </div>
    ),
  width,
});

export const Quantity = ({ width = 90 } = {}) =>
  sortableColumns.number({
    align: 'right',
    dataIndex: 'quantity',
    render: (value, fill) => <Value.Numeric type="quantity" value={value} />,
    title: <Trans i18nKey="trader.orders.columns.quantity">Quantity</Trans>,
    width,
  });

export const Side = ({ width = 60, sortable = true } = {}) => {
  const column = {
    dataIndex: 'side',
    title: <Trans i18nKey="trader.orders.columns.side">Side</Trans>,
    render: value => (
      <span
        className={cn('lowercase', {
          'green-positive': value === ORDER_SIDE.BUY,
          'red-negative': value !== ORDER_SIDE.BUY,
        })}
      >
        {value === ORDER_SIDE.BUY ? (
          <Trans i18nKey="trader.orderEntry.buy" />
        ) : (
          <Trans i18nKey="trader.orderEntry.sell" />
        )}
      </span>
    ),
    width,
  };

  return sortable ? sortableColumns.string(column) : column;
};

export const LiquidationPriceDelta = ({
  width = 90,
  title,
  dataIndex = 'liquidationPriceDelta',
}) => ({
  align: 'left',
  dataIndex,
  title: title || (
    <Trans i18nKey="trader.orderEntry.confirmation.liqDelta">
      Mark Price / Est. Liq Price Difference
    </Trans>
  ),
  render: value => <Value.Numeric type="percentage" decimals={2} value={value} />,
});

export const Size = ({ width = 100, sortable = true, title, dataIndex = 'size' } = {}) => {
  const column = {
    align: 'right',
    dataIndex,
    render: value => <Value.Numeric type="quantity" value={value} />,
    title: title || <Trans i18nKey="trader.orders.columns.quantity">Quantity</Trans>,
    width,
  };

  return sortable ? sortableColumns.number(column) : column;
};

export const SizeFilled = ({ width = 140, sortable = true, abbreviated } = {}) => {
  const column = {
    align: 'right',
    dataIndex: 'sizeFilled',
    render: value => <Value.Numeric type="quantity" value={value} />,
    title: abbreviated ? (
      <Trans i18nKey="trader.orders.columns.quantityFilledAbbreviated">Qty. Filled</Trans>
    ) : (
      <Trans i18nKey="trader.orders.columns.quantityFilled">Quantity Filled</Trans>
    ),
    width,
  };

  return sortable ? sortableColumns.number(column) : column;
};

export const Status = ({ width = 90 } = {}) =>
  sortableColumns.string({
    align: 'left',
    dataIndex: 'status',
    render: (value, { message, size, sizeFilled }) => {
      let status = value;

      if (status === ORDER_STATUS.CANCELED && !BigNumber(sizeFilled).isZero()) {
        status = ORDER_STATUS.PARTIAL;
      } else if (size === sizeFilled) {
        status = ORDER_STATUS.FILLED;
      } else if (status === ORDER_STATUS.RECEIVED) {
        status = ORDER_STATUS.PENDING;
      }

      return message ? <InfoTooltip title={message}>{status}</InfoTooltip> : status;
    },
    title: <Trans i18nKey="trader.orders.columns.status">Status</Trans>,
    width,
  });

export const Type = ({ width = 140, sortable = true, verbose = false } = {}) => {
  const orderTypeToString = {
    [ORDER_TYPE.STOP_MARKET]: t('trader.orderEntry.stopMarket', { defaultValue: 'stop' }),
    [ORDER_TYPE.TAKE_MARKET]: t('trader.orderEntry.takeMarket', { defaultValue: 'take' }),
    [ORDER_TYPE.STOP_LIMIT]: t('trader.orderEntry.stopLimit', { defaultValue: 'stop limit' }),
    [ORDER_TYPE.TAKE_LIMIT]: t('trader.orderEntry.takeLimit', { defaultValue: 'take limit' }),
  };

  const column = {
    dataIndex: 'orderType',
    title: <Trans i18nKey="trader.orders.columns.type">Type</Trans>,
    render: (value, { pegPriceType, stopOrderType }) => (
      <span className="lowercase">
        {pegPriceType ? (
          <>
            {t('trader.orderEntry.stopMarketTrailing', { defaultValue: 'trailing stop' })}
            {verbose && pegPriceType === PEG_PRICE_TYPE.PERCENT ? ' (%)' : ''}
          </>
        ) : (
          orderTypeToString[value] || value
        )}
      </span>
    ),
    width,
  };

  return sortable ? sortableColumns.string(column) : column;
};
