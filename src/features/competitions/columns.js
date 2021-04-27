import React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import cn from 'classnames';
import BigNumber from 'bignumber.js';

import { Currency, InfoTooltip, Tooltip, Value, Table } from '../../common/components/trader';

const { DescriptionHeader, sortableColumns } = Table;

export const RankColumn = ({ dataIndex = 'preRank', width = 8 } = {}) =>
  sortableColumns.number({
    dataIndex,
    title: null,
    width,
    render: (
      value,
      { hasStarted, percentChange, isEligible, inactiveTrader, isCurrentUser, rank }
    ) => (
      <div
        className={cn({
          'inactive-trader-value': (inactiveTrader && hasStarted && !isCurrentUser) || !isEligible,
        })}
      >
        {(!inactiveTrader && hasStarted && isEligible) || dataIndex !== 'preRank' ? rank : 'N/A'}
      </div>
    ),
  });

export const NameColumn = ({ dataIndex = 'sortAlias', width = 40 } = {}) =>
  sortableColumns.string({
    dataIndex,
    title: <Trans i18nKey="competition.table.column.name">Name</Trans>,
    width,
    render: (value, { alias, anonymousName, hasStarted, inactiveTrader, isCurrentUser }) =>
      isCurrentUser && !alias ? (
        <Link to="/settings/competitions">
          <Trans i18nKey="competition.table.setLeaderboardName">Set your leaderboard name</Trans>
        </Link>
      ) : (
        <div
          className={cn({
            'inactive-trader-value': inactiveTrader && hasStarted && !isCurrentUser,
          })}
        >
          {alias || anonymousName}
        </div>
      ),
  });

export const ReferralCountColumn = ({ width = 15 } = {}) =>
  sortableColumns.number({
    align: 'right',
    dataIndex: 'referralCount',
    title: (
      <InfoTooltip title={<Trans i18nKey="competition.table.column.referralsTooltip" />}>
        <Trans i18nKey="competition.table.column.referrals">Referrals</Trans>
      </InfoTooltip>
    ),
    render: (value, { hasStarted, inactiveTrader }) => (
      <div className={cn({ 'inactive-trader-value': inactiveTrader && hasStarted })}>
        <Value.Numeric type="size" decimals={0} value={value || 0} />
      </div>
    ),
    width,
  });

export const TradeCountColumn = ({ width = 15 } = {}) =>
  sortableColumns.number({
    align: 'right',
    dataIndex: 'tradeCount',
    title: <Trans i18nKey="competition.table.column.count">Trades</Trans>,
    render: (value, { hasStarted, inactiveTrader }) => (
      <div className={cn({ 'inactive-trader-value': inactiveTrader && hasStarted })}>
        <Value.Numeric type="size" decimals={0} value={value || 0} />
      </div>
    ),
    width,
  });

export const TradeVolumeColumn = ({ width = 20 } = {}) =>
  sortableColumns.number({
    align: 'right',
    dataIndex: 'tradeVolume',
    title: (
      <DescriptionHeader>
        <Trans i18nKey="competition.table.column.volume">Volume</Trans>
        <Currency inline />
      </DescriptionHeader>
    ),
    render: (value, { hasStarted, inactiveTrader, tradeCount, tradeVolume }) => (
      <div
        className={cn({
          'inactive-trader-value':
            (inactiveTrader || (tradeVolume === '0' && tradeCount === '1')) && hasStarted,
        })}
      >
        {tradeVolume === '0' && tradeCount === '1' ? (
          'N/A'
        ) : (
          <Value.Numeric type="currency" noPrefix value={value || 0} />
        )}
      </div>
    ),
    width,
  });

export const SharpeRatioColumn = ({ width = 16 } = {}) =>
  sortableColumns.number({
    align: 'right',
    dataIndex: 'sharpeRatio',
    render: (value, { hasStarted, inactiveTrader, sharpeEligible }) => (
      <div className={cn({ 'inactive-trader-value': (inactiveTrader && hasStarted) || !value })}>
        {value ? (
          <div className={cn({ 'top-sharpe': sharpeEligible })}>
            <Value.Numeric type="quantity" decimals={4} value={value} />
          </div>
        ) : (
          <Tooltip title={<Trans i18nKey="competition.table.column.sharpeNA" />}>N/A</Tooltip>
        )}
      </div>
    ),
    title: (
      <>
        <Trans i18nKey="competition.table.column.sharpe">Sharpe</Trans>
        <a
          href="https://support.crypto.io/hc/en-us/articles/360034714533-What-is-a-Sharpe-Ratio-"
          target="_blank"
          rel="noopener noreferrer"
        >
          <InfoTooltip title={<Trans i18nKey="competition.table.column.sharpeTooltip" />} />
        </a>
      </>
    ),
    width,
  });

export const RektPercentColumn = ({ width = 16 } = {}) =>
  sortableColumns.number({
    align: 'right',
    dataIndex: 'rektPercent',
    render: (value, { hasStarted, inactiveTrader }) =>
      value > 1 ? (
        <div className="very-rekt">
          {BigNumber(value)
            .multipliedBy(100)
            .dp(2)
            .toString()}
        </div>
      ) : (
        <div
          className={cn({
            'inactive-trader-value': value < 0 || (inactiveTrader && hasStarted),
          })}
        >
          {value < 0
            ? 'N/A'
            : BigNumber(value)
                .multipliedBy(100)
                .dp(2)
                .toString()}
        </div>
      ),
    title: (
      <InfoTooltip title={<Trans i18nKey="competition.table.column.rektTooltip" />}>
        <Trans i18nKey="competition.table.column.rekt">Rekt</Trans>
      </InfoTooltip>
    ),
    width,
  });

export const NotionalGain = ({ dataIndex = 'notional', title, width = 30 } = {}) =>
  sortableColumns.number({
    align: 'right',
    dataIndex,
    render: value => <Value.Numeric type="size" decimals={8} withDirection value={value} />,
    title: title || <Trans i18nKey="competition.table.column.notional">Notional PL (BTC)</Trans>,
    width,
  });

export const ValueChangeColumn = ({ dataIndex = 'percentChange', width = 30 } = {}) =>
  sortableColumns.number({
    align: 'right',
    dataIndex,
    render: (value, { hasStarted, inactiveTrader }) => (
      <div className={cn({ 'inactive-trader-value': inactiveTrader && hasStarted })}>
        {inactiveTrader ? (
          'N/A'
        ) : (
          <Value.Numeric type="percentage" decimals={4} withDirection value={value} />
        )}
      </div>
    ),
    title: <Trans i18nKey="competition.table.column.change">Change (Total Collateral)</Trans>,
    width,
  });
