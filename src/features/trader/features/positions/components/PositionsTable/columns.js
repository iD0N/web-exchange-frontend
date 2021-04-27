import React from 'react';
import { Trans } from 'react-i18next';
import BigNumber from 'bignumber.js';

import { Table, Value, Currency, InfoTooltip } from '../../../../../../common/components/trader';

import ClosePositionButton from './ClosePositionButton';

const { DescriptionHeader, sortableColumns } = Table;

const columns = ({ onClosePositionClick }) => [
  {
    align: 'center',
    alwaysVisible: true,
    dataIndex: 'action',
    render: (_, position) => (
      <ClosePositionButton position={position} onClick={onClosePositionClick} />
    ),
    width: 50,
  },
  sortableColumns.string({
    dataIndex: 'contractCode',
    title: <Trans i18nKey="trader.positions.contract">Contract</Trans>,
    width: 100,
  }),
  sortableColumns.number({
    align: 'right',
    dataIndex: 'quantity',
    render: value => <Value.Numeric withDirection type="quantity" value={value} />,
    title: <Trans i18nKey="trader.positions.quantity">Quantity</Trans>,
    width: 100,
  }),
  sortableColumns.number({
    align: 'right',
    dataIndex: 'averageEntryPrice',
    render: value => <Value.Numeric autoDecimals type="price" value={value} />,
    title: (
      <DescriptionHeader>
        <InfoTooltip
          title={
            <Trans i18nKey="trader.positions.avgExecutionPriceFull">
              Average execution price for the life of this position.
            </Trans>
          }
        >
          <Trans i18nKey="trader.positions.avgExecutionPrice">Avg Exec Price</Trans>
        </InfoTooltip>
      </DescriptionHeader>
    ),
    width: 140,
  }),
  sortableColumns.number({
    align: 'right',
    dataIndex: 'liquidationPrice',
    render: (value, { quantity, priceDecimals }) =>
      BigNumber(quantity).isZero() ? (
        ''
      ) : isNaN(value) ? (
        <InfoTooltip
          title={
            'Changes in the price of this contract will not independently result in liquidation if this is the only position held.'
          }
        >
          N/A
        </InfoTooltip>
      ) : !!value ? (
        <Value.Numeric decimals={priceDecimals} type="price" value={value} />
      ) : (
        ''
      ),
    title: (
      <DescriptionHeader>
        <InfoTooltip
          title={
            <Trans i18nKey="trader.positions.liquidationPriceDescription">
              The contract mark price at which your account will be liquidated, assuming the size
              and market value of your other positions do not change.
            </Trans>
          }
        >
          <Trans i18nKey="trader.positions.liquidationPrice">Liquidation Price</Trans>
        </InfoTooltip>
      </DescriptionHeader>
    ),
    width: 160,
  }),
  sortableColumns.number({
    align: 'right',
    dataIndex: 'markPrice',
    render: value => <Value.Numeric autoDecimals type="price" value={value} />,
    title: (
      <DescriptionHeader>
        <InfoTooltip
          title={
            <Trans i18nKey="trader.positions.markPriceDescription">
              The marking price used for unrealized P/L and auto-liquidation decisions. See Help &
              Support for more info.
            </Trans>
          }
        >
          <Trans i18nKey="trader.positions.markPrice">Mark Price</Trans>
        </InfoTooltip>
      </DescriptionHeader>
    ),
    width: 120,
  }),
  sortableColumns.number({
    align: 'right',
    dataIndex: 'lastTradePrice',
    render: value => <Value.Numeric autoDecimals type="price" value={value} />,
    title: (
      <DescriptionHeader>
        <Trans i18nKey="trader.positions.lastTradePrice">Last Price</Trans>
      </DescriptionHeader>
    ),
    width: 110,
  }),
  sortableColumns.number({
    align: 'right',
    dataIndex: 'unrealizedPl',
    render: value => <Value.Numeric type="currency" noPrefix withDirection value={value} />,
    title: (
      <DescriptionHeader>
        <InfoTooltip
          title={
            <Trans i18nKey="trader.positions.unrealizedPlDescription">
              Unrealized profit or loss (P/L) from open positions.
            </Trans>
          }
        >
          <Trans i18nKey="trader.positions.unrealizedPl">Unrealized P/L</Trans>
        </InfoTooltip>
        <Currency />
      </DescriptionHeader>
    ),
    width: 150,
  }),
  sortableColumns.number({
    align: 'right',
    dataIndex: 'realizedPl',
    render: value => <Value.Numeric type="currency" noPrefix withDirection value={value} />,
    title: (
      <DescriptionHeader>
        <InfoTooltip
          title={
            <Trans i18nKey="trader.positions.realizedPlDescription">
              Realized profit or loss (P/L) from open positions that have been closed or partially
              closed during the current day (since midnight UTC).
            </Trans>
          }
        >
          <Trans i18nKey="trader.positions.realizedPl">Realized P/L </Trans>
        </InfoTooltip>

        <Currency />
      </DescriptionHeader>
    ),
    width: 130,
  }),
  sortableColumns.number({
    align: 'right',
    dataIndex: 'totalPl',
    render: value => <Value.Numeric type="currency" noPrefix withDirection value={value} />,
    title: (
      <DescriptionHeader>
        <InfoTooltip
          title={
            <Trans i18nKey="trader.positions.totalPlDescription">
              Unrealized P/L plus realized P/L.
            </Trans>
          }
        >
          <Trans i18nKey="trader.positions.totalPl">Total P/L</Trans>
        </InfoTooltip>

        <Currency />
      </DescriptionHeader>
    ),
    width: 120,
  }),
  sortableColumns.number({
    align: 'right',
    dataIndex: 'dayPl',
    render: value => <Value.Numeric type="currency" noPrefix withDirection value={value} />,
    title: (
      <DescriptionHeader>
        <InfoTooltip
          title={
            <Trans i18nKey="trader.positions.dayPlDescription">
              Changes in Total P/L for the day (since midnight UTC).
            </Trans>
          }
        >
          <Trans i18nKey="trader.positions.dayPl">Day P/L</Trans>
        </InfoTooltip>

        <Currency />
      </DescriptionHeader>
    ),
    width: 110,
  }),
  sortableColumns.number({
    align: 'right',
    dataIndex: 'marketValue',
    render: value => <Value.Numeric type="currency" noPrefix value={value} />,
    title: (
      <DescriptionHeader>
        <Trans i18nKey="trader.positions.marketValue">Market Value</Trans>
        <Currency />
      </DescriptionHeader>
    ),
    width: 130,
  }),
];

export default columns;
