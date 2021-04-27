import React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import moment from 'moment';

import { Currency, Table } from '../../../common/components/trader';
import { getSeriesLongName } from '../../../common/utils/translationMaps';


import Chart from './Chart';
import MarkPrice from './MarkPrice';
import PercentChangeValue from './PercentChange';
import VolumeColumn from './Volume';

const { DescriptionHeader, sortableColumns } = Table;

const labelByDataIndex = dataIndex => {
  const label = {
    originalPrice1h: '1h',
    originalPrice24h: '24h',
    originalPrice7d: '7d',
  };

  return label[dataIndex];
};

export const LongName = ({ width = 100, sortable = true } = {}) => {
  const column = {
    dataIndex: 'longName',
    title: <Trans i18nKey="trader.orders.columns.name">Name</Trans>,
    width,
    render: (value, { contractCode }) => (
      <Link to={`/trader/${value}`}>
        <div className="dashboard-contract-name">{getSeriesLongName(contractCode)}</div>
      </Link>
    ),
  };

  return sortable ? sortableColumns.string(column) : column;
};

export const Contract = ({ width = 60, sortable = true } = {}) => {
  const column = {
    dataIndex: 'contractCode',
    title: <Trans i18nKey="trader.orders.columns.ticker">Ticker</Trans>,
    width,
    render: value => (
      <Link to={`/trader/${value}`}>
        <div className="dashboard-contract-name">{value}</div>
      </Link>
    ),
  };

  return sortable ? sortableColumns.string(column) : column;
};

export const Price = ({ sortable = true, width = 60 } = {}) => {
  const column = {
    align: 'right',
    dataIndex: 'markPrice',
    render: (value, { contractCode, priceDecimals }) =>
      value && (
        <MarkPrice priceDecimals={priceDecimals} contractCode={contractCode} value={value} />
      ),
    title: (
      <DescriptionHeader>
        <Trans i18nKey="trader.positions.price">Price</Trans>
        <Currency inline />
      </DescriptionHeader>
    ),
    width,
  };

  return sortable ? sortableColumns.number(column) : column;
};

export const Volume = ({ sortable = true, width = 60 } = {}) => {
  const column = {
    align: 'right',
    dataIndex: 'volume',
    render: (value, { priceDecimals }) =>
      value && (
        <VolumeColumn priceDecimals={priceDecimals} value={value} />
      ),
    title: (
      <DescriptionHeader>
        <Trans i18nKey="trader.orders.columns.volume">Volume (24H)</Trans>
      </DescriptionHeader>
    ),
    width,
  };

  return sortable ? sortableColumns.number(column) : column;
};

export const PercentChange = ({
  dataIndex = 'originalPrice7d',
  sortable = true,
  width = 60,
} = {}) => {
  const column = {
    align: 'right',
    dataIndex,
    render: (value, { closed, contractCode, markPrice, returns }) => {
      if (dataIndex !== 'originalPrice7d' && closed && (!returns || moment().isBefore(returns))) {
        return 'Closed';
      }
      return (
        <PercentChangeValue
          contractCode={contractCode}
          defaultMarkPrice={markPrice}
          referencePrice={value}
        />
      );
    },
    title: (
      <>
        <Trans i18nKey="dashboard.table.column.change">Change</Trans>
        {` (${labelByDataIndex(dataIndex)})`}
      </>
    ),
    width,
  };

  return sortable ? sortableColumns.number(column) : column;
};

export const ChangeChart = ({ width = 70 } = {}) => ({
  align: 'center',
  dataIndex: 'index',
  title: (
    <>
      <Trans i18nKey="trader.orders.columns.price">Price</Trans>
      {' (7d)'}
    </>
  ),
  render: (value, { contractCode }) => (
    <div className="dashboard-chart-cell select-disabled">
      <div className="dashboard-chart">
        <Chart contractCode={contractCode} />
      </div>
    </div>
  ),
  width,
});
