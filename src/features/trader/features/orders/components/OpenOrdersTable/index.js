import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';

import { logEventAction } from '../../../../../../common/services/eventLogger';
import {
  EVENT_ACTIONS,
  EVENT_TYPES,
} from '../../../../../../common/services/eventLogger/constants';
import { IsMobile } from '../../../../../../common/components';
import { Table } from '../../../../../../common/components/trader';

import {
  cancelOrderAction,
  selectOpenOrders,
  selectOpenOrdersFiltered,
  selectOrdersWithContractMetadata,
} from '../../ducks';
import {
  Age,
  AverageFillPrice,
  OpenOrderActions,
  Contract,
  OrderId,
  PostOnly,
  Price,
  ReduceOnly,
  Side,
  Size,
  SizeFilled,
  Status,
  TrailValue,
  Trigger,
  Type,
} from '../columns';

const filteredSelector = selectOrdersWithContractMetadata(selectOpenOrdersFiltered);
const unfilteredSelector = selectOrdersWithContractMetadata(selectOpenOrders);

const { SORT_ORDERS } = Table;

const columns = ({ cancelOrder, logCancel, logModify }) => [
  OpenOrderActions({ cancelOrder, logCancel, logModify }),
  OrderId(),
  Side(),
  Contract(),
  Type(),
  Size(),
  SizeFilled(),
  Price(),
  AverageFillPrice(),
  Status(),
  Trigger(),
  Price({ isTriggerPrice: true, dataIndex: 'stopPrice', width: 150 }),
  TrailValue(),
  ReduceOnly(),
  PostOnly(),
  Age(),
];

const mapStateToProps = (state, { filtered }) => ({
  openOrders: filtered ? filteredSelector(state) : unfilteredSelector(state),
});

const mapDispatchToProps = {
  cancelOrder: cancelOrderAction,
  logEvent: logEventAction,
};

class OpenOrdersTable extends Component {
  static propTypes = {
    config: PropTypes.object,
    isLoading: PropTypes.bool.isRequired,
    openOrders: PropTypes.array.isRequired,
    onConfigChange: PropTypes.func.isRequired,
    cancelOrder: PropTypes.func.isRequired,
  };

  logCancel = order =>
    this.props.logEvent({
      action: EVENT_ACTIONS.CANCEL_ORDER,
      isMobile: !!this.props.isMobile,
      orderInfo: order,
      type: EVENT_TYPES.CLICK,
      widget: 'open-orders-table',
    });
  logModify = order =>
    this.props.logEvent({
      action: EVENT_ACTIONS.MODIFY_ORDER_INITIATE,
      isMobile: !!this.props.isMobile,
      orderInfo: order,
      type: EVENT_TYPES.CLICK,
      widget: 'open-orders-table',
    });

  columns = columns({
    cancelOrder: this.props.cancelOrder,
    logCancel: this.logCancel,
    logModify: this.logModify,
  });

  render() {
    const { isLoading, openOrders, config, onConfigChange } = this.props;

    return (
      <Table
        columns={openOrders.length > 0 ? this.columns : this.columns.slice(1)}
        config={config}
        dataSource={openOrders}
        defaultSortKey="createdAt"
        defaultSortOrder={SORT_ORDERS.DESC}
        emptyText={<Trans i18nKey="trader.orders.noOrders">No Orders</Trans>}
        enableColumnManagement
        enableColumnOrdering
        enableResize
        enableSort
        id="openOrders"
        loading={isLoading}
        pageSize="auto"
        rowKey="orderId"
        onConfigChange={onConfigChange}
      />
    );
  }
}

export default IsMobile(connect(mapStateToProps, mapDispatchToProps)(OpenOrdersTable));
