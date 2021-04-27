import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { connectSpinner } from '../../../../common/services/spinner';
import { connectKeyValueStore } from '../../../../common/services/keyValueStore';
import { WS_CHANNELS } from '../../constants';
import ChannelSubscription from '../../ws-subscription/containers/ChannelSubscription';
import { selectGlobalContractCode } from '../../data-store/ducks';
import { cancelOrdersBySideAction } from '../trade-mode/ducks'; // TODO uplift

import { apiCallIds } from './api';
import { fetchOpenOrdersAction, fetchOrderHistoryActions, fetchOrderFillsActions } from './ducks';
import Orders from './components/Orders';
import ModifyOrderModal from './components/ModifyOrderModal';

const ORDERS_WIDGET_CONFIG_VALUE_KEY = 'ordersWidgetConfig';

const widgetConfigInitialValue = {
  openOrdersTableConfig: {},
  orderHistoryTableConfig: {},
  fillsTableConfig: {},
  filtered: false,
};

const EnhancedOrders = connectSpinner({
  isLoading: apiCallIds.FETCH_ORDERS_WIDGET_CONFIG,
  isFetchingOrders: apiCallIds.FETCH_OPEN_ORDERS,
  isFetchingHistory: apiCallIds.FETCH_ORDER_HISTORY,
  isFetchingFills: apiCallIds.FETCH_FILLS,
})(Orders);

const mapStateToProps = (state, props) => ({
  widgetConfig: props[ORDERS_WIDGET_CONFIG_VALUE_KEY],
  globalContractCode: selectGlobalContractCode(state),
});

const mapDispatchToProps = {
  cancelAllOrders: cancelOrdersBySideAction,
  fetchOpenOrders: fetchOpenOrdersAction.request,
  fetchOrderHistory: fetchOrderHistoryActions.request,
  fetchOrderFills: fetchOrderFillsActions.request,
};

class OrdersContainer extends Component {
  static propTypes = {
    fetchOpenOrders: PropTypes.func.isRequired,
    fetchOrderHistory: PropTypes.func.isRequired,
    fetchOrderFills: PropTypes.func.isRequired,
    widgetConfig: PropTypes.object.isRequired,
    getValue: PropTypes.func.isRequired,
    setValue: PropTypes.func.isRequired,
    globalContractCode: PropTypes.string.isRequired,
  };

  static defaultProps = {
    widgetConfig: {},
  };

  componentDidMount() {
    this.props.getValue(
      {
        apiCallId: apiCallIds.FETCH_ORDERS_WIDGET_CONFIG,
      },
      widgetConfigInitialValue
    );
    this.props.fetchOpenOrders();
  }

  handleCancelAllOrdersFiltered = () =>
    this.props.cancelAllOrders({ contractCode: this.props.globalContractCode });

  handleFilteredChange = () => {
    const { filtered } = this.props.widgetConfig;
    this.props.setValue({
      ...this.props.widgetConfig,
      filtered: !filtered,
    });
  };

  handleOpenOrdersTableConfigChange = openOrdersTableConfig => {
    this.props.setValue({
      ...this.props.widgetConfig,
      openOrdersTableConfig,
    });
  };

  handleOrderHistoryTableConfigChange = orderHistoryTableConfig => {
    this.props.setValue({
      ...this.props.widgetConfig,
      orderHistoryTableConfig,
    });
  };

  handleFillsTableConfigChange = fillsTableConfig => {
    this.props.setValue({
      ...this.props.widgetConfig,
      fillsTableConfig,
    });
  };

  handleWidgetConfigReset = () => this.props.setValue(widgetConfigInitialValue);

  render() {
    const { cancelAllOrders, globalContractCode, widgetConfig } = this.props;

    return (
      <ChannelSubscription channel={WS_CHANNELS.ORDERS}>
        <EnhancedOrders
          toggleFiltered={this.handleFilteredChange}
          widgetConfig={widgetConfig}
          globalContractCode={globalContractCode}
          cancelAllOrders={cancelAllOrders}
          cancelAllOrdersFiltered={this.handleCancelAllOrdersFiltered}
          onOpenOrdersTableConfigChange={this.handleOpenOrdersTableConfigChange}
          onOrderHistoryTableConfigChange={this.handleOrderHistoryTableConfigChange}
          onFillsTableConfigChange={this.handleFillsTableConfigChange}
          onWidgetConfigReset={this.handleWidgetConfigReset}
        />
        <ModifyOrderModal />
      </ChannelSubscription>
    );
  }
}

export default connectKeyValueStore(ORDERS_WIDGET_CONFIG_VALUE_KEY)(
  connect(mapStateToProps, mapDispatchToProps)(OrdersContainer)
);
