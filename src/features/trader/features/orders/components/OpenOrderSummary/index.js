import React, { memo } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Trans } from 'react-i18next';

import { IsMobile } from '../../../../../../common/components';
import { Currency, Table } from '../../../../../../common/components/trader';

import { isOfMarketOrderType, isStopOrderType } from '../../utils';
import {
  Contract,
  Fee,
  LiquidationPriceDelta,
  PostOnly,
  Price,
  ReduceOnly,
  Side,
  Size,
  SizeFilled,
  Trigger,
  TrailValue,
  Type,
} from '../columns';
import Desktop from './index.desktop';
import Mobile from './index.mobile';

const { DescriptionHeader } = Table;

const OpenOrdersSummary = ({ isMobile, condensed, order, priceDecimals, quoteCurrency }) =>
  isMobile || condensed ? (
    <Mobile order={order} priceDecimals={priceDecimals} quoteCurrency={quoteCurrency} />
  ) : (
    <Desktop order={order} priceDecimals={priceDecimals} quoteCurrency={quoteCurrency} />
  );

OpenOrdersSummary.propTypes = {
  condensed: PropTypes.bool,
  isMobile: PropTypes.bool.isRequired,
  order: PropTypes.object.isRequired,
};

export default IsMobile(memo(OpenOrdersSummary));

export const columns = (
  {
    contractCode,
    currentPosition,
    estLiquidationPrice,
    showLiq,
    liquidationPriceDelta,
    makerFee,
    markPrice,
    netPositionSize,
    notional,
    orderId,
    orderType,
    pegPriceType,
    postOnly,
    positionSize,
    reduceOnly,
    side,
    size,
    stopPrice,
    stopTrigger,
    takerFee,
    effectiveLeverage,
  },
  quoteCurrency,
  priceDecimals
) => [
  ...(contractCode ? [Contract({ width: 45, sortable: false })] : []),
  ...(markPrice
    ? [
        Price({
          title: (
            <DescriptionHeader>
              <Trans i18nKey="trader.orderEntry.stopTrigger.mark">Mark Price</Trans>
              <Currency inline value={quoteCurrency} />
            </DescriptionHeader>
          ),
          dataIndex: 'markPrice',
          sortable: false,
          priceDecimals,
        }),
      ]
    : []),
  ...(side ? [Side({ width: 30, sortable: false })] : []),
  ...(orderType ? [Type({ width: 60, sortable: false, verbose: true })] : []),
  ...(!!pegPriceType ? [TrailValue()] : []),
  ...(size ? [Size({ width: 40, sortable: false })] : []),
  ...(orderId
    ? [
        SizeFilled({
          width: isStopOrderType(orderType) ? 40 : 60,
          sortable: false,
          abbreviated: isStopOrderType(orderType),
        }),
      ]
    : []),
  ...(!!orderType && !isOfMarketOrderType(orderType)
    ? [
        Price({
          sortable: false,
          width: 40,
          priceDecimals,
          title: (
            <DescriptionHeader>
              <Trans i18nKey="trader.orders.columns.price">Price</Trans>
              <Currency value={quoteCurrency} inline />
            </DescriptionHeader>
          ),
        }),
      ]
    : []),
  ...(!!stopTrigger && !!orderType && isStopOrderType(orderType)
    ? [Trigger({ sortable: false, stopTrigger })]
    : []),
  ...(!!orderType && !!stopPrice
    ? [
        Price({
          width: isStopOrderType(orderType) ? 90 : 60,
          isTriggerPrice: isStopOrderType(orderType),
          sortable: false,
          priceDecimals,
          dataIndex: 'stopPrice',
          orderType,
        }),
      ]
    : []),
  ...(reduceOnly === true ? [ReduceOnly({ rightAlign: true })] : []),
  ...(!isOfMarketOrderType(orderType) && postOnly === true ? [PostOnly({ rightAlign: true })] : []),
  ...(notional
    ? [
        Price({
          title: (
            <DescriptionHeader>
              <Trans i18nKey="trader.orderEntry.confirmation.total">Total</Trans>
              <Currency value={quoteCurrency} inline />
            </DescriptionHeader>
          ),
          priceDecimals,
          dataIndex: 'notional',
          sortable: false,
          showNA: !notional,
        }),
      ]
    : []),
  ...(currentPosition
    ? [
        Size({
          title: (
            <DescriptionHeader>
              <Trans i18nKey="trader.orderEntry.confirmation.currentPosition">
                Current Position
              </Trans>
            </DescriptionHeader>
          ),
          dataIndex: 'currentPosition',
          sortable: false,
        }),
      ]
    : []),
  ...(positionSize || positionSize === 0
    ? [
        Size({
          title: (
            <DescriptionHeader>
              <Trans i18nKey="trader.orderEntry.confirmation.positionAfterExecution">
                Position After Execution
              </Trans>
            </DescriptionHeader>
          ),
          dataIndex: 'positionSize',
          sortable: false,
        }),
      ]
    : []),
  ...(showLiq
    ? [
        estLiquidationPrice === undefined
          ? {
              dataIndex: 'estLiquidationPrice',
              title: (
                <DescriptionHeader>
                  <Trans i18nKey="trader.orderEntry.confirmation.estLiquidationPrice">
                    Est. Liquidation Price
                  </Trans>
                </DescriptionHeader>
              ),
              render: value => <div className="red-negative">Auto-liquidation</div>,
            }
          : Price({
              title: (
                <DescriptionHeader>
                  <Trans i18nKey="trader.orderEntry.confirmation.estLiquidationPrice">
                    Est. Liquidation Price
                  </Trans>
                </DescriptionHeader>
              ),
              priceDecimals,
              dataIndex: 'estLiquidationPrice',
              sortable: false,
              showNA: isNaN(estLiquidationPrice),
            }),
      ]
    : []),
  ...(makerFee
    ? [
        Fee({
          title: (
            <DescriptionHeader>
              <Trans i18nKey="trader.orderEntry.confirmation.rebate">Rebate (if maker)</Trans>
              {/* TODO(rogs): show fee currency
              <Currency inline value={feeCurrency} /> */}
            </DescriptionHeader>
          ),
          dataIndex: 'makerFee',
          sortable: false,
          showNA: !makerFee,
        }),
      ]
    : []),
  ...(takerFee
    ? [
        Fee({
          title: (
            <DescriptionHeader>
              <Trans i18nKey="trader.orderEntry.confirmation.fee">Fee (if taker)</Trans>
              {/* TODO(rogs): show fee currency
              <Currency inline value={feeCurrency} /> */}
            </DescriptionHeader>
          ),
          dataIndex: 'takerFee',
          sortable: false,
          showNA: !takerFee,
        }),
      ]
    : []),
  ...(liquidationPriceDelta ? [LiquidationPriceDelta({ width: 45 })] : []),
  ...(effectiveLeverage || effectiveLeverage === 0
    ? [
        {
          dataIndex: 'effectiveLeverage',
          title: (
            <DescriptionHeader>
              <Trans i18nKey="trader.orderEntry.confirmation.leverageAfterExecution">
                Portfolio Leverage After Execution
              </Trans>
            </DescriptionHeader>
          ),
          render: value => (value !== Infinity ? `${value}x` : 'N/A'),
        },
      ]
    : []),
];

export const SummaryTable = props => (
  <Table
    className={cn('order-summary-table', { 'order-summary-table-condensed': props.isMobile })}
    id="open-order-summary"
    {...props}
  />
);
