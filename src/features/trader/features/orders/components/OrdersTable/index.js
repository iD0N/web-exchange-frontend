import React from 'react';
import PropTypes from 'prop-types';

import { connectSpinner } from '../../../../../../common/services/spinner';

import { apiCallIds } from '../../api';
import OpenOrdersTable from '../OpenOrdersTable';
import OrderHistoryTable from '../OrderHistoryTable';
import FillsTable from '../FillsTable';

const TABS = {
  ORDERS: 'ORDERS',
  ORDER_HISTORY: 'ORDER_HISTORY',
  FILLS: 'FILLS',
};

const EnhancedOpenOrdersTable = connectSpinner({
  isLoading: apiCallIds.CANCEL_ORDER,
})(OpenOrdersTable);

const OrdersTable = ({
  activeKey,
  widgetConfig: { openOrdersTableConfig, orderHistoryTableConfig, fillsTableConfig, filtered },
  onOpenOrdersTableConfigChange,
  onOrderHistoryTableConfigChange,
  onFillsTableConfigChange,
}) => {
  switch (activeKey) {
    case TABS.ORDERS:
      return openOrdersTableConfig ? (
        <EnhancedOpenOrdersTable
          config={openOrdersTableConfig}
          filtered={filtered}
          onConfigChange={onOpenOrdersTableConfigChange}
        />
      ) : null;
    case TABS.ORDER_HISTORY:
      return orderHistoryTableConfig ? (
        <OrderHistoryTable
          config={orderHistoryTableConfig}
          filtered={filtered}
          onConfigChange={onOrderHistoryTableConfigChange}
        />
      ) : null;
    case TABS.FILLS:
      return fillsTableConfig ? (
        <FillsTable
          config={fillsTableConfig}
          onConfigChange={onFillsTableConfigChange}
          filtered={filtered}
        />
      ) : null;
    default:
      return null;
  }
};

OrdersTable.propTypes = {
  activeKey: PropTypes.string.isRequired,
  widgetConfig: PropTypes.object.isRequired,
  onOpenOrdersTableConfigChange: PropTypes.func.isRequired,
  onOrderHistoryTableConfigChange: PropTypes.func.isRequired,
  onFillsTableConfigChange: PropTypes.func.isRequired,
};

export default OrdersTable;
