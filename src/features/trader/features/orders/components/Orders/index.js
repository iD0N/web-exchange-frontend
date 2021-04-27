import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans, translate } from 'react-i18next';

import IsLoggedIn from '../../../../../../common/services/user/IsLoggedIn';
import { Spin } from '../../../../../../common/components';
import { Tabs, Table } from '../../../../../../common/components/trader';
import { GridLayoutTile } from '../../../../components';

import { selectIsTabLoaded } from '../../ducks';
import { TABS } from '../../constants';
import OrdersControls from '../OrdersControls';
import OrdersTable from '../OrdersTable';

const { WithTabs } = Tabs;

const TABS_T = () => ({
  [TABS.ORDERS]: <Trans i18nKey="trader.orders.orders">Orders</Trans>,
  [TABS.ORDER_HISTORY]: <Trans i18nKey="trader.orders.orderHistory">Order History</Trans>,
  [TABS.FILLS]: <Trans i18nKey="trader.orders.fills">Fills</Trans>,
});

const mapStateToProps = state => ({
  openOrdersLoaded: selectIsTabLoaded(state, TABS.ORDERS),
});

const Orders = ({
  cancelAllOrders,
  cancelAllOrdersFiltered,
  globalContractCode: contractCode,
  isFetchingOrders,
  isFetchingHistory,
  isFetchingFills,
  isLoggedIn,
  openOrdersLoaded,
  t,
  toggleFiltered,
  widgetConfig,
  widgetConfig: { filtered },
  onOpenOrdersTableConfigChange,
  onOrderHistoryTableConfigChange,
  onFillsTableConfigChange,
  onWidgetConfigReset,
}) => (
  <WithTabs defaultKey={TABS.ORDERS} tabs={TABS} tabsT={TABS_T()}>
    {({ activeKey }) => (
      <Spin
        spinning={
          isLoggedIn &&
          (!openOrdersLoaded || isFetchingOrders || isFetchingHistory || isFetchingFills)
        }
      >
        <Table.ColumnsManagementModalContextProvider>
          <GridLayoutTile
            requiresAuth
            title={isLoggedIn ? <Tabs /> : TABS_T()[TABS.ORDERS]}
            controls={
              <OrdersControls
                cancelAllOrders={cancelAllOrders}
                cancelAllOrdersFiltered={cancelAllOrdersFiltered}
                contractCode={contractCode}
                filtered={!!filtered}
                toggleFiltered={toggleFiltered}
                onWidgetConfigReset={onWidgetConfigReset}
              />
            }
            content={
              <OrdersTable
                activeKey={activeKey}
                widgetConfig={widgetConfig}
                onOpenOrdersTableConfigChange={onOpenOrdersTableConfigChange}
                onOrderHistoryTableConfigChange={onOrderHistoryTableConfigChange}
                onFillsTableConfigChange={onFillsTableConfigChange}
              />
            }
          />
        </Table.ColumnsManagementModalContextProvider>
      </Spin>
    )}
  </WithTabs>
);

Orders.propTypes = {
  cancelAllOrders: PropTypes.func.isRequired,
  cancelAllOrdersFiltered: PropTypes.func.isRequired,
  globalContractCode: PropTypes.string.isRequired,
  toggleFiltered: PropTypes.func.isRequired,
  isFetchingHistory: PropTypes.bool.isRequired,
  isFetchingFills: PropTypes.bool.isRequired,
  isFetchingOrders: PropTypes.bool.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  widgetConfig: PropTypes.object.isRequired,
  openOrdersLoaded: PropTypes.bool.isRequired,
  onOpenOrdersTableConfigChange: PropTypes.func.isRequired,
  onOrderHistoryTableConfigChange: PropTypes.func.isRequired,
  onFillsTableConfigChange: PropTypes.func.isRequired,
  onWidgetConfigReset: PropTypes.func.isRequired,
};

export default translate()(connect(mapStateToProps)(IsLoggedIn(Orders)));
