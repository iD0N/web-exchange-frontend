import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';

import { connectSpinner } from '../../../../../../common/services/spinner';
import { Table } from '../../../../../../common/components/trader';

import { apiCallIds } from '../../api';
import { TABS } from '../../constants';
import {
  fetchOrderHistoryActions,
  selectIsTabLoaded,
  selectOrderHistory,
  selectOrderHistoryFiltered,
  selectOrdersWithContractMetadata,
} from '../../ducks';
import {
  AverageFillPrice,
  Contract,
//  FeeCurrency,
//  Fees,
  OrderDate,
  OrderId,
  Price,
  Side,
  Size,
  SizeFilled,
  Status,
  Type,
} from '../columns';

const filteredSelector = selectOrdersWithContractMetadata(selectOrderHistoryFiltered);
const unfilteredSelector = selectOrdersWithContractMetadata(selectOrderHistory);

const { SORT_ORDERS } = Table;

const columns = [
  OrderId(),
  Contract(),
  Side(),
  Type(),
  Size(),
  SizeFilled(),
  Price(),
  AverageFillPrice(),
  // Fees(),
  // FeeCurrency(),
  Status(),
  OrderDate(),
];

const mapStateToProps = (state, ownProps) => {
  const { filtered } = ownProps;
  const orderHistory = filtered ? filteredSelector(state) : unfilteredSelector(state);
  return ({
    orderHistory: orderHistory.map(addFeeCurrency),
    isTabLoaded: selectIsTabLoaded(state, TABS.ORDER_HISTORY),
  });
}

const mapDispatchToProps = {
  fetchOrderHistory: fetchOrderHistoryActions.request,
};

class OrderHistoryTable extends Component {
  static propTypes = {
    config: PropTypes.object,
    fetchOrderHistory: PropTypes.func.isRequired,
    isFetchingHistory: PropTypes.bool.isRequired,
    isTabLoaded: PropTypes.bool.isRequired,
    orderHistory: PropTypes.array.isRequired,
    onConfigChange: PropTypes.func.isRequired,
  };

  componentWillMount() {
    if (!this.props.isTabLoaded && !this.props.isFetchingHistory) {
      this.props.fetchOrderHistory();
    }
  }

  render() {
    const { config, orderHistory, onConfigChange } = this.props;

    return (
      <Table
        columns={columns}
        config={config}
        dataSource={orderHistory}
        defaultSortKey="createdAt"
        defaultSortOrder={SORT_ORDERS.DESC}
        emptyText={<Trans i18nKey="trader.orders.noOrderHistory">No Order History</Trans>}
        enableColumnManagement
        enableColumnOrdering
        enableResize
        enableSort
        id="orderHistory"
        pageSize="auto"
        rowKey="orderId"
        onConfigChange={onConfigChange}
      />
    );
  }
}

function addFeeCurrency(orderHistoryRow) {
  const { contractType, quoteCurrency } = orderHistoryRow;

  return {
    ...orderHistoryRow,
    // TODO(rogs): consider getting the fee currency from the fills rather than assuming that it's
    // USD for derivatives and the same as the quote currency for spot
    feeCurrency: contractType === 'spot' ? quoteCurrency : 'USD',
  };
}

export default connectSpinner({
  isFetchingHistory: apiCallIds.FETCH_ORDER_HISTORY,
})(connect(mapStateToProps, mapDispatchToProps)(OrderHistoryTable));
