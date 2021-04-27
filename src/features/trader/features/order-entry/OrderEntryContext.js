import React, { Component, createContext } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import pick from 'lodash.pick';
import { show } from 'redux-modal';

import { t } from '../../../../common/services/i18n';
import NotificationService from '../../../../common/services/notification';
import { receiveMessageAction } from '../../../../common/services/webSocket';
import { selectCanTrade } from '../../../../common/services/user';
import AlertService from '../../../../common/services/alert';
import { connectKeyValueStore } from '../../../../common/services/keyValueStore';
//import { IsMobile } from '../../../../common/components';
import {
  CONTRACT_TYPE,
  ORDER_SIDE,
  ORDER_STOP_TRIGGER,
  ORDER_TYPE,
} from '../../../../common/enums';
import { selectGlobalContract } from '../../data-store/ducks';
import { LEVEL_SIDES } from '../order-book/utils/constants'; // TODO uplift
import { isOfMarketOrderType, isStopOrderType } from '../orders/utils';

import {
  CONFIRM_ORDER_MODAL_ID,
  CONFIG_KEYS,
  ORDER_ENTRY_WIDGET_CONFIG_VALUE_KEY,
  widgetConfigInitialValue,
  SIZE_TYPE,
} from './constants';
import { apiCallIds, submitOrderAction } from './ducks';
import { getCost, getQuantity, normalizeOrder } from './utils';

const OrderEntryContext = createContext('orderEntry');

export const OrderEntryConsumer = OrderEntryContext.Consumer;

const initialValues = {
  notional: { value: undefined },
  orderType: { value: ORDER_TYPE.LIMIT },
  postOnly: { value: false },
  price: { value: undefined },
  reduceOnly: { value: false },
  size: { value: undefined },
  sizeType: { value: SIZE_TYPE.QUANTITY },
  stopOrderType: { value: ORDER_TYPE.STOP_LIMIT },
  stopPrice: { value: undefined },
  stopTrigger: { value: ORDER_STOP_TRIGGER.MARK },
  trailValue: { value: undefined },
};

const mapStateToProps = (state, props) => ({
  canPlaceOrders: selectCanTrade(state),
  widgetConfig: props[ORDER_ENTRY_WIDGET_CONFIG_VALUE_KEY],
  globalContract: selectGlobalContract(state) || {},
  isMobile: false,
});

const mapDispatchToProps = {
  receiveMessage: receiveMessageAction,
  submitOrder: submitOrderAction,
  showConfirmOrderModal: props => show(CONFIRM_ORDER_MODAL_ID, props),
};

class Provider extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    getValue: PropTypes.func.isRequired,
    globalContract: PropTypes.object.isRequired,
    isMobile: PropTypes.bool.isRequired,
    setValue: PropTypes.func.isRequired,
    widgetConfig: PropTypes.object.isRequired,
  };

  static defaultProps = {
    widgetConfig: widgetConfigInitialValue,
  };

  constructor(props) {
    super(props);

    this.state = {
      handleChange: this.handleChange,
      handleClose: this.close,
      handleConfirmationToggle: this.handleConfirmationToggle,
      handleClosePositionConfirmationToggle: this.handleClosePositionConfirmationToggle,
      handleSubmit: this.handleSubmit,
      handleToggle: this.handleToggle,
      globalContract: props.globalContract,
      canPlaceOrders: props.canPlaceOrders,
      isOpened: props.isMobile ? false : true,
      notional: initialValues.notional,
      orderType: initialValues.orderType,
      postOnly: initialValues.postOnly,
      price: initialValues.price,
      reduceOnly: initialValues.reduceOnly,
      setLimitOrder: this.setLimitOrder,
      setOrderSize: this.setOrderSize,
      setOrderNotionalSize: this.setOrderNotionalSize,
      size: initialValues.size,
      sizeType: initialValues.sizeType,
      stopOrderType: initialValues.stopOrderType,
      stopPrice: initialValues.stopPrice,
      stopTrigger: initialValues.stopTrigger,
      trailValue: initialValues.trailValue,
      widgetConfig: props.widgetConfig,
    };
  }

  static getDerivedStateFromProps(
    { globalContract: { fairPrice, markPrice, type } },
    { isOpened, price, orderType }
  ) {
    const refPrice = Provider.#getRefPrice(type, fairPrice, markPrice);
    if (
      isOpened &&
      orderType.value === ORDER_TYPE.LIMIT &&
      price.value === undefined &&
      refPrice !== undefined
    ) {
      return {
        price: { value: refPrice },
        stopPrice: { value: refPrice },
      };
    }

    return null;
  }

  componentDidMount() {
    this.props.getValue(
      {
        apiCallId: apiCallIds.FETCH_ORDER_ENTRY_WIDGET_CONFIG,
      },
      widgetConfigInitialValue
    );
  }

  componentDidUpdate(
    {
      globalContract: { contractCode: prevContractCode, underlying: prevUnderlying },
      isMobile: wasMobile,
      widgetConfig: { defaultSizeType: prevDefaultSizeType },
    },
    {
      orderType: { value: prevOrderType },
      sizeType: { value: prevSizeType },
      stopOrderType: { value: prevStopOrderType },
    }
  ) {
    const {
      globalContract,
      globalContract: { contractCode },
      isMobile,
      widgetConfig,
      widgetConfig: { defaultSizeType },
    } = this.props;
    const { isOpened, notional, orderType, price, size, stopOrderType, sizeType } = this.state;
    const refPrice = this.getRefPrice();

    if (!wasMobile && isMobile && isOpened) {
      this.close();
    } else if (wasMobile && !isMobile && !isOpened) {
      this.open();
    } else if (contractCode !== prevContractCode) {
      this.setState({
        size: initialValues.size,
        price: { value: refPrice },
        stopPrice: { value: refPrice },
        globalContract,
      });
    } else if (prevSizeType !== sizeType.value) {
      if (prevSizeType === SIZE_TYPE.NOTIONAL && sizeType.value === SIZE_TYPE.QUANTITY) {
        this.setOrderSize(
          getQuantity(
            notional.value,
            orderType.value === ORDER_TYPE.MARKET ? refPrice : price.value
          )
        );
      } else if (prevSizeType === SIZE_TYPE.QUANTITY && sizeType.value === SIZE_TYPE.NOTIONAL) {
        this.setOrderNotionalSize(
          getCost(orderType.value === ORDER_TYPE.MARKET ? refPrice : price.value, size.value)
        );
      }
    } else if (
      !!defaultSizeType &&
      prevDefaultSizeType !== defaultSizeType &&
      sizeType.value !== defaultSizeType
    ) {
      if ([SIZE_TYPE.QUANTITY, SIZE_TYPE.NOTIONAL].includes(defaultSizeType)) {
        this.setState({ sizeType: { value: defaultSizeType }, widgetConfig });
      }
    } else if (prevOrderType !== orderType.value) {
      if (isStopOrderType(prevOrderType) !== isStopOrderType(orderType.value)) {
        this.setState({
          reduceOnly: { value: isStopOrderType(orderType.value) ? true : false },
          stopOrderType: { value: orderType.value },
        });
      } else if (
        [ORDER_TYPE.TAKE_LIMIT, ORDER_TYPE.TAKE_MARKET].includes(orderType.value) !==
        [ORDER_TYPE.TAKE_LIMIT, ORDER_TYPE.TAKE_MARKET].includes(prevOrderType)
      ) {
        this.setState({ stopOrderType: { value: orderType.value } });
      }
    } else if (isStopOrderType(orderType.value) && prevStopOrderType !== stopOrderType.value) {
      this.setState({ trailValue: { value: undefined } });
    } else if (
      isStopOrderType(orderType.value) &&
      [ORDER_TYPE.TAKE_LIMIT, ORDER_TYPE.TAKE_MARKET].includes(orderType.value) &&
      [ORDER_TYPE.STOP_MARKET_TRAILING, ORDER_TYPE.STOP_MARKET_TRAILING_PCT].includes(
        stopOrderType.value
      )
    ) {
      this.setState({ stopOrderType: { value: ORDER_TYPE.TAKE_LIMIT } });
    } else if (widgetConfig !== this.state.widgetConfig) {
      this.setState({ widgetConfig, sizeType: { value: widgetConfig[CONFIG_KEYS.DEFAULT_SIZE_TYPE] } });
    }
  }

  handleClosePositionConfirmationToggle = disableClosePositionConfirmation =>
    this.handleWidgetConfigChange({ disableClosePositionConfirmation });

  handleConfirmationToggle = isOrderConfimationRequired =>
    this.handleWidgetConfigChange({ isOrderConfimationRequired });

  handleWidgetConfigChange = config =>
    this.props.setValue({
      ...this.props.widgetConfig,
      ...config,
    });

  open = () => {
    const {
      orderType: { value },
    } = this.state;
    const refPrice = this.getRefPrice();

    this.setState({
      isOpened: true,
      size: initialValues.size,
      price: value === ORDER_TYPE.LIMIT ? { value: refPrice } : initialValues.price,
    });
  };

  close = () =>
    this.setState({
      isOpened: false,
      price: initialValues.price,
      size: initialValues.size,
    });

  handleToggle = () => (this.state.isOpened ? this.close() : this.open());

  handleChange = update => {
    const refPrice = this.getRefPrice();

    if (update.orderType && update.orderType.value === ORDER_TYPE.LIMIT) {
      update.price = {
        value: refPrice,
      };
    }
    if (Object.keys(update).length > 0) {
      this.setState(
        pick(update, [
          'isOpened',
          'notional',
          'orderType',
          'postOnly',
          'price',
          'reduceOnly',
          'size',
          'sizeType',
          'stopOrderType',
          'stopPrice',
          'stopTrigger',
          'trailValue',
        ])
      );
    }

    if (
      update.sizeType &&
      [SIZE_TYPE.QUANTITY, SIZE_TYPE.NOTIONAL].includes(update.sizeType.value)
    ) {
      this.handleWidgetConfigChange({ [CONFIG_KEYS.DEFAULT_SIZE_TYPE]: update.sizeType.value });
    }
  };

  handleSubmit = (
    {
      contract = {},
      notional,
      orderType: type,
      postOnly,
      price,
      reduceOnly,
      size,
      sizeType,
      stopOrderType,
      stopPrice,
      stopTrigger,
      trailValue,
    },
    { side, extras },
    hideMobileModal
  ) => {
    if (!this.props.canPlaceOrders) {
      NotificationService['error']({
        body: t('trader.notifications.kycError'),
        subject: 'Order Rejected',
        onClick: () => {
          this.props.history.push('/identity');
        },
        forceAppNotif: true,
      });
      return;
    }

    const {
      globalContract: { isExpired, contractCode, priceDecimals },
      submitOrder,
      widgetConfig: { isOrderConfimationRequired },
    } = this.props;

    if (isExpired) {
      return AlertService.error('Cannot place orders for expired contract.');
    }

    const order = normalizeOrder({
      contractCode: contract.contractCode || contractCode,
      notional,
      postOnly,
      price,
      priceDecimals: contract.priceDecimals || priceDecimals,
      reduceOnly,
      size,
      sizeType,
      stopOrderType,
      stopPrice,
      stopTrigger,
      trailValue,
      type,
      side,
      ...extras,
    });

    if (!isOrderConfimationRequired) {
      if (isOfMarketOrderType(order.orderType)) {
        delete order.price;
        order.postOnly = false;
      }
      if (contract && contract.type === CONTRACT_TYPE.SPOT) {
        order.reduceOnly = false;
        order.postOnly = false;
      }
      submitOrder(order);
      if (hideMobileModal) {
        hideMobileModal();
      }
    } else {
      this.props.showConfirmOrderModal({
        order,
        handleConfirm: order => {
          if (isOfMarketOrderType(order.orderType)) {
            delete order.price;
            order.postOnly = false;
          }
          if (contract && contract.type === CONTRACT_TYPE.SPOT) {
            order.reduceOnly = false;
            order.postOnly = false;
          }
          submitOrder(order);
          if (hideMobileModal) {
            hideMobileModal();
          }
        },
        isOrderConfimationRequired,
        toggleConfirmation: this.handleConfirmationToggle,
      });
    }
  };

  setOrderNotionalSize = value =>
    !isNaN(value)
      ? this.setState({ notional: { value }, sizeType: { value: SIZE_TYPE.NOTIONAL } })
      : this.setState({ notional: { value: 0 }, sizeType: { value: SIZE_TYPE.NOTIONAL }});

  setOrderSize = value =>
    !isNaN(value)
      ? this.setState({ sizeType: { value: SIZE_TYPE.QUANTITY }, size: { value } })
      : this.setState({ size: { value: 0 }, sizeType: { value: SIZE_TYPE.QUANTITY } });

  setLimitOrder = (price, side) =>
    this.setState({
      isOpened: true,
      price: { value: price },
      stopPrice: [ORDER_TYPE.STOP_LIMIT, ORDER_TYPE.TAKE_LIMIT]
        ? { value: price }
        : this.state.stopPrice.value,
      side: { value: side === LEVEL_SIDES.ASK ? ORDER_SIDE.SELL : ORDER_SIDE.BUY },
      orderType: {
        value:
          this.state.orderType.value === ORDER_TYPE.MARKET
            ? ORDER_TYPE.LIMIT
            : this.state.orderType.value,
      },
    });

  static #getRefPrice = (type, fairPrice, markPrice) =>
    type === CONTRACT_TYPE.SPOT ? fairPrice : markPrice;

  getRefPrice = () => {
    const {
      globalContract: { fairPrice, markPrice, type },
    } = this.props;

    return Provider.#getRefPrice(type, fairPrice, markPrice);
  };

  render() {
    return (
      <OrderEntryContext.Provider value={this.state}>
        {this.props.children}
      </OrderEntryContext.Provider>
    );
  }
}

export const OrderEntryProvider = connectKeyValueStore(ORDER_ENTRY_WIDGET_CONFIG_VALUE_KEY)(
  connect(mapStateToProps, mapDispatchToProps)(withRouter(Provider))
);

export const ConnectOrderEntryContext = ComposedComponent => props => (
  <OrderEntryConsumer>
    {state => <ComposedComponent {...props} orderEntryContext={state} />}
  </OrderEntryConsumer>
);
