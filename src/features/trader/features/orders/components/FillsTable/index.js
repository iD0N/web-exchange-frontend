import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';

import { connectSpinner } from '../../../../../../common/services/spinner';
import { Table } from '../../../../../../common/components/trader';

import { apiCallIds } from '../../api';
import { TABS } from '../../constants';
import {
  fetchOrderFillsActions,
  selectIsTabLoaded,
  selectOrderFills,
  selectOrderFillsFiltered,
  selectOrdersWithContractMetadata,
} from '../../ducks';
import {
  Age,
  Contract,
  OrderId,
  Price,
  Quantity,
  // Fee,
  // FeeCurrency,
  Side,
} from '../columns';

const filteredSelector = selectOrdersWithContractMetadata(selectOrderFillsFiltered);
const unfilteredSelector = selectOrdersWithContractMetadata(selectOrderFills);

const { SORT_ORDERS } = Table;

const columns = [
  OrderId(),
  Contract(),
  Side(),
  Quantity(),
  Price(),
  // Fee(),
  // FeeCurrency(),
  Age({ dataIndex: 'timestamp' }),
];

const mapStateToProps = (state, { filtered }) => ({
  orderFills: filtered ? filteredSelector(state) : unfilteredSelector(state),
  isTabLoaded: selectIsTabLoaded(state, TABS.FILLS),
});

const mapDispatchToProps = {
  fetchOrderFills: fetchOrderFillsActions.request,
};

class FillsTable extends Component {
  static propTypes = {
    isFetchingFills: PropTypes.bool.isRequired,
    orderFills: PropTypes.array.isRequired,
    config: PropTypes.object,
    onConfigChange: PropTypes.func.isRequired,
  };

  componentWillMount() {
    if (!this.props.isTabLoaded && !this.props.isFetchingFills) {
      this.props.fetchOrderFills();
    }
  }

  render() {
    const { config, orderFills, onConfigChange } = this.props;

    return (
      <Table
        columns={columns}
        config={config}
        dataSource={orderFills}
        defaultSortKey="timestamp"
        defaultSortOrder={SORT_ORDERS.ASC}
        emptyText={<Trans i18nKey="trader.orders.noFills">No Fills</Trans>}
        enableColumnManagement
        enableColumnOrdering
        enableResize
        enableSort
        id="fillHistory"
        pageSize="auto"
        rowKey="rowKey"
        onConfigChange={onConfigChange}
      />
    );
  }
}

export default connectSpinner({
  isFetchingFills: apiCallIds.FETCH_FILLS,
})(connect(mapStateToProps, mapDispatchToProps)(FillsTable));
