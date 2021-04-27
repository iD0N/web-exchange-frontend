import React from 'react';
import PropTypes from 'prop-types';

import { columns, SummaryTable } from './';

const mobileColumns = [
  { dataIndex: 'title', width: 65 },
  { dataIndex: 'value', width: 35 },
];

const OpenOrdersSummary = ({ order, priceDecimals, quoteCurrency }) => {
  const dataSource = columns(order, quoteCurrency, priceDecimals).map(
    ({ title, dataIndex, render }) => ({
      dataIndex,
      title,
      value: render ? render(order[dataIndex], order) : order[dataIndex],
    })
  );

  return (
    <SummaryTable
      columns={mobileColumns}
      dataSource={dataSource}
      rowKey="dataIndex"
      showHeader={false}
      isMobile
    />
  );
};

OpenOrdersSummary.propTypes = {
  order: PropTypes.object.isRequired,
};

export default OpenOrdersSummary;
