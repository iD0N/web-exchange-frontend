import React from 'react';
import { Trans } from 'react-i18next';
import moment from 'moment';

import { InfoTooltip, Table, Tooltip, Value } from '../../../../../common/components/trader';

import { TRANSFER_STATUS, TRANSFER_TYPE } from '../constants';

const { DescriptionHeader, sortableColumns } = Table;

export const truncateTransferId = transferId => (transferId ? transferId.slice(-7) : 'Pending');

const normalizedStatus = {
  [TRANSFER_STATUS.SUBMITTED]: TRANSFER_STATUS.PENDING,
  [TRANSFER_STATUS.REQUESTED]: TRANSFER_STATUS.PENDING,
  [TRANSFER_STATUS.COMPLETED]: TRANSFER_STATUS.CONFIRMED,
  [TRANSFER_STATUS.COMPLETE]: TRANSFER_STATUS.CONFIRMED,
};

export const CreatedColumn = ({ width = 25 } = {}) =>
  sortableColumns.age({
    dataIndex: 'createdAt',
    render: value => (
      <Tooltip title={<Value.Date type="datetime" value={value} />}>
        {moment(value).isSame(new Date(), 'day') ? (
          <>
            <Value.Duration value={value} />
            {' ago'}
          </>
        ) : (
          <Value.Date type={'date'} value={value} />
        )}
      </Tooltip>
    ),
    title: (
      <DescriptionHeader>
        <Trans i18nKey="settings.transfers.table.column.created">Created</Trans>
      </DescriptionHeader>
    ),
    width,
  });

export const ConfirmedAtColumn = ({ width = 25 } = {}) =>
  sortableColumns.age({
    dataIndex: 'confirmedAt',
    render: value =>
      !!value && (
        <Tooltip title={<Value.Date type="datetime" value={value} />}>
          {moment(value).isSame(new Date(), 'day') ? (
            <>
              <Value.Duration value={value} />
              {' ago'}
            </>
          ) : (
            <Value.Date type={'date'} value={value} />
          )}
        </Tooltip>
      ),
    title: <Trans i18nKey="settings.transfers.table.column.confirmed">Confirmed</Trans>,
    width,
  });

export const SizeColumn = ({ width = 25 } = {}) =>
  sortableColumns.number({
    align: 'right',
    dataIndex: 'amount',
    render: (value, { decimalPlaces }) => (
      <Tooltip title={<Value.Numeric type="size" decimals={decimalPlaces} value={value} />}>
        <Value.Numeric type="size" decimals={decimalPlaces} value={value} />
      </Tooltip>
    ),
    title: <Trans i18nKey="settings.transfers.table.column.amount">Amount</Trans>,
    width,
  });

export const CancelColumn = ({ onCancel, width = 15 } = {}) => ({
  dataIndex: 'cancel',
  render: (_, { status, transferId }) => (
    <>
      {!!onCancel && (normalizedStatus[status] || status) === TRANSFER_STATUS.PENDING && (
        <div className="cancel-withdrawal-btn capitalized" onClick={() => onCancel({ transferId })}>
          Cancel
        </div>
      )}
    </>
  ),
  width,
});

export const StatusColumn = ({ width = 25 } = {}) =>
  sortableColumns.string({
    dataIndex: 'status',
    title: <Trans i18nKey="settings.transfers.table.column.status">Status</Trans>,
    render: (status, { transferId, type, destinationAddress }) => {
      const displayStatus = <div className="capitalized">{normalizedStatus[status] || status}</div>;
      return destinationAddress && type === TRANSFER_TYPE.WITHDRAWAL ? (
        <InfoTooltip
          title={
            <>
              <Trans i18nKey="settings.transfers.withdrawals.sendTo" /> {destinationAddress}
            </>
          }
        >
          {displayStatus}
        </InfoTooltip>
      ) : (
        displayStatus
      );
    },
    width,
  });

export const TokenColumn = ({ width = 25 } = {}) =>
  sortableColumns.string({
    dataIndex: 'tokenCode',
    title: <Trans i18nKey="settings.transfers.table.column.token">Token</Trans>,
    width,
  });

export const TransferIdColumn = ({ width = 25 } = {}) =>
  sortableColumns.string({
    dataIndex: 'transferId',
    title: <Trans i18nKey="settings.transfers.table.column.transferId">Transfer ID</Trans>,
    render: truncateTransferId,
    width,
  });

export const TypeColumn = ({ width = 30 } = {}) =>
  sortableColumns.string({
    dataIndex: 'type',
    title: <Trans i18nKey="settings.transfers.table.column.type">Type</Trans>,
    width,
    render: type => <div className="capitalized">{type}</div>,
  });
