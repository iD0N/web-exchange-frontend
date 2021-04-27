import React from 'react';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';
import moment from 'moment';

import { TimeUtils } from '@acdxio/common';

import { IsMobile, Spin } from '../../../common/components';
import { Table } from '../../../common/components/trader';

import { LongName, Contract, Price, Volume, PercentChange, ChangeChart } from './columns';

const columns = [
  LongName(),
  Contract(),
  Price(),
  Volume(),
  PercentChange({ dataIndex: 'originalPrice24h' }),
  ChangeChart(),
];

const columnsMobile = [
  Contract(),
  Price(),
  PercentChange({ dataIndex: 'originalPrice24h' }),
  ChangeChart(),
];

const mapStateToProps = (state, { outages, summary }) => {
  const summaryWithOutages = summary.map(item => {
    if (outages && outages[item.contractCode]) {
      const { start, end } = TimeUtils.processRecurrence(outages[item.contractCode]);
      if (moment().isAfter(start) && !end) {
        return { ...item, closed: true };
      } else if (moment().isAfter(start) && moment().isBefore(end)) {
        return { ...item, closed: true, returns: end.toISOString() };
      }
    }
    return item;
  });

  return { summaryWithOutages };
};

const Dashboard = ({ isLoading, isMobile, summaryWithOutages }) => (
  <Spin spinning={isLoading}>
    <h1>
      <Trans i18nKey="dashboard.title">Market Summary</Trans>
    </h1>
    <Table
      columns={isMobile ? columnsMobile : columns}
      dataSource={summaryWithOutages}
      id="dashboard-contracts-table"
      rowKey="contractCode"
      rowHeight={80}
      pageSize={1000}
    />
  </Spin>
);

export default IsMobile(connect(mapStateToProps)(Dashboard));
