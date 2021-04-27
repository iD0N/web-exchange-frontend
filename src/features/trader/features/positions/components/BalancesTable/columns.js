import React from 'react';
import { Trans } from 'react-i18next';
import BigNumber from 'bignumber.js';

import {
  Button,
  ButtonLink,
  Currency,
  InfoTooltip,
  Table,
  Value,
} from '../../../../../../common/components/trader';

const { DescriptionHeader, sortableColumns } = Table;

const columns = ({ isRebalancingUsd, setTransferToken, showConvertModal }) => [
  sortableColumns.string({
    dataIndex: 'tokenCode',
    title: <Trans i18nKey="trader.positions.balances.token">Token</Trans>,
    width: 60,
  }),
  sortableColumns.number({
    align: 'right',
    dataIndex: 'balance',
    render: (value, { decimalPlaces }) => (
      <Value.Numeric decimals={8} type="quantity" value={value} />
    ),
    title: <Trans i18nKey="trader.positions.balances.balance">Balance</Trans>,
    width: 80,
  }),
  sortableColumns.number({
    align: 'right',
    dataIndex: 'freeBalance',
    render: (value, { decimalPlaces }) => (
      <Value.Numeric decimals={8} type="quantity" value={value} />
    ),
    title: (
      <DescriptionHeader>
        <InfoTooltip
          title={
            <Trans i18nKey="trader.positions.balances.freeBalanceTooltip">
              Your total token balance not reserved by withdrawal requests or open spot orders.
            </Trans>
          }
        >
          <Trans i18nKey="trader.positions.balances.freeBalance">Free Balance</Trans>
        </InfoTooltip>
      </DescriptionHeader>
    ),
    width: 140,
  }),
  sortableColumns.number({
    align: 'right',
    dataIndex: 'price',
    render: value =>
      value && (
        <>
          <Value.Numeric decimals={2} type="price" value={value} />
        </>
      ),
    title: (
      <DescriptionHeader>
        <Trans i18nKey="trader.positions.balances.price">Price</Trans>
        <Currency inline />
      </DescriptionHeader>
    ),
    width: 90,
  }),
  sortableColumns.number({
    align: 'right',
    dataIndex: 'marketValue',
    render: value =>
      value !== undefined &&
      !Number.isNaN(value) && (
        <>
          <Value.Numeric decimals={2} type="currency" noPrefix value={value} />
        </>
      ),
    title: (
      <DescriptionHeader>
        <Trans i18nKey="trader.positions.marketValue">Market Value</Trans>
        <Currency inline />
      </DescriptionHeader>
    ),
    width: 145,
  }),
  {
    dataIndex: 'rowKey',
    title: null,
    width: 160,
    align: 'left',
    render: (value, { freeBalance, tokenCode, isTransferable }) =>
      isTransferable && (
        <div className="balances-transfer-column">
          <ButtonLink
            size="small"
            onClick={() => setTransferToken(tokenCode)}
            to="/settings/transfers"
          >
            <Trans i18nKey="trader.positions.balances.deposit">Deposit</Trans>
          </ButtonLink>
          <ButtonLink
            size="small"
            onClick={() => setTransferToken(tokenCode)}
            to="/settings/transfers"
          >
            <Trans i18nKey="trader.positions.balances.withdraw">Withdraw</Trans>
          </ButtonLink>
          {BigNumber(freeBalance).isNegative() && (<Button
            disabled={isRebalancingUsd}
            size="small"
            onClick={showConvertModal}
          >
            {isRebalancingUsd
              ? <Trans i18nKey="trader.modal.convert.loading">Converting...</Trans>
              : <Trans i18nKey="trader.modal.convert.button">Convert</Trans>
            }
          </Button>)}
        </div>
      ),
  },
];

export default columns;
