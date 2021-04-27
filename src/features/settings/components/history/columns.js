import React from 'react';
import { Trans } from 'react-i18next';

import { Currency, Table, Value } from '../../../../common/components/trader';

import { TRANSACTION_LABEL } from './constants';

const { sortableColumns } = Table;

export const truncateTransferId = transferId => (transferId ? transferId.slice(-7) : 'Pending');

export const CreatedColumn = ({ dataIndex, width = 25 } = {}) =>
  sortableColumns.age({
    dataIndex: dataIndex || 'createdAt',
    render: value => (      
      <Value.Date type={'date'} value={value} />
    ),
    title:
      dataIndex === 'date' ? (
        <Trans i18nKey="settings.history.table.column.date">Date (UTC)</Trans>
      ) : (
        <Trans i18nKey="settings.history.table.column.created">Created</Trans>
      ),
    width,
  });

export const SizeColumn = ({ width = 30, tokenCode = 'USD' } = {}) =>
  sortableColumns.number({
    align: 'right',
    dataIndex: 'amount',
    render: (value, { tokenCode, decimalPlaces }) => (
      <Value.Numeric type="currency" noPrefix decimals={decimalPlaces || 8} value={value} />
    ),
    title: (
      <>
        <Trans i18nKey="settings.history.table.column.amount">Amount</Trans>{' '}
        <Currency value={tokenCode} />
      </>
    ),
    width,
  });

export const BalanceColumn = ({ dataIndex, title, width = 30, tokenCode = 'USD' } = {}) =>
  sortableColumns.number({
    align: 'right',
    dataIndex: dataIndex || 'balance',
    render: (value, { decimalPlaces }) => (
      <Value.Numeric type="currency" decimals={decimalPlaces || 8} noPrefix value={value} />
    ),
    title: title || (
      <>
        <Trans
          i18nKey={
            dataIndex === 'eodBalance'
              ? 'settings.history.table.column.eodBalance'
              : 'settings.history.table.column.balance'
          }
        >
          Balance
        </Trans>{' '}
        <Currency value={tokenCode} />
      </>
    ),
    width,
  });

export const TransactionIdColumn = ({ width = 15 } = {}) =>
  sortableColumns.string({
    dataIndex: 'transactionId',
    title: <Trans i18nKey="settings.history.table.column.id">ID</Trans>,
    render: truncateTransferId,
    width,
  });

export const DetailsColumn = ({ width = 30 } = {}) => ({
  dataIndex: 'details',
  title: <Trans i18nKey="settings.history.table.column.details">Details</Trans>,
  width,
  render: details => !!details && <div className="capitalized">{details}</div>,
});

export const ContractColumn = ({ width = 15 } = {}) =>
  sortableColumns.string({
    dataIndex: 'contractCode',
    title: <Trans i18nKey="settings.history.table.column.contract">Contract</Trans>,
    width,
    render: contractCode => contractCode,
  });

export const EventColumn = ({ width = 30 } = {}) =>
  sortableColumns.string({
    dataIndex: 'transactionType',
    title: <Trans i18nKey="settings.history.table.column.event">Event</Trans>,
    width,
    render: transactionType => (
      <div className="capitalized">
        {TRANSACTION_LABEL[transactionType] ? (
          <Trans i18nKey={TRANSACTION_LABEL[transactionType]} />
        ) : (
          'Other'
        )}
      </div>
    ),
  });

export const ValueColumn = ({ dataIndex, type, width = 30 } = {}) => ({
  dataIndex,
  title: <Trans i18nKey={TRANSACTION_LABEL[type]} />,
  width,
  align: 'right',
  render: value => value || '0',
});
