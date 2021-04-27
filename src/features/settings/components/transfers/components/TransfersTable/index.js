import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { Col, Spin } from '../../../../../../common/components';
import { Table } from '../../../../../../common/components/trader';

import {
  CancelColumn,
  ConfirmedAtColumn,
  CreatedColumn,
  SizeColumn,
  StatusColumn,
  TokenColumn,
  TransferIdColumn,
  TypeColumn,
} from '../columns';

const columns = onCancel => [
  TransferIdColumn(),
  TypeColumn(),
  CreatedColumn(),
  ConfirmedAtColumn(),
  SizeColumn(),
  TokenColumn(),
  StatusColumn(),
  CancelColumn({ onCancel }),
];

class TransfersTable extends Component {
  static propTypes = {
    onCancel: PropTypes.func.isRequired,
    transfers: PropTypes.array.isRequired,
    isRequestingTransfers: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.columns = columns(props.onCancel);
  }

  render() {
    const { isRequestingTransfers, transfers } = this.props;

    return (
      <Col span={24}>
        <h2>
          <Trans i18nKey="settings.transfers.title">Transfers</Trans>
        </h2>
        <div className="transfers-table-wrapper">
          <Spin spinning={isRequestingTransfers}>
            <Table
              columns={this.columns}
              dataSource={transfers}
              emptyText={
                <Trans i18nKey="settings.transfers.completed.noHistory">
                  No Completed Transfers History
                </Trans>
              }
              defaultSortKey="createdAt"
              defaultSortOrder={Table.SORT_ORDERS.ASC}
              id="completed-transfers-history"
              pageSize={14}
              rowKey="transferId"
              enableColumnOrdering
              enableResize
              enableSort
            />
          </Spin>
        </div>
      </Col>
    );
  }
}

export default TransfersTable;
