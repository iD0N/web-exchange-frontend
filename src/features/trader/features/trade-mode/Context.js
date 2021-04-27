import React, { Component, createContext } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import localStorage from 'localStorage';
import BigNumber from 'bignumber.js';

import { EVENT_ACTIONS, EVENT_TYPES } from '../../../../common/services/eventLogger/constants';
import AlertService from '../../../../common/services/alert';
import { ORDER_TYPE } from '../../../../common/enums';
import { toPriceString } from '../../../../common/utils/numberHelpers';
import { selectIsInOutage } from '../../data-store/ducks';
import { selectTradeModeDefault } from './ducks';

const isQuantityValid = orderQuantity => {
  const quantity = BigNumber(orderQuantity);
  return !quantity.isZero() && quantity.isFinite() && quantity.isPositive();
};

const TradeModeContext = createContext('tradeMode');

export const TradeModeConsumer = TradeModeContext.Consumer;

export const HideInTradeMode = ({ children }) => (
  <TradeModeConsumer>{({ tradeEnabled }) => !tradeEnabled && children}</TradeModeConsumer>
);

const qtyPresetPrefix = 'trade-mode-qty-preset';
const qtyMap = {};

const setDefaultQty = (widgetName, contractCode, qty) => {
  const qtyKey = `${qtyPresetPrefix}-${widgetName}-${contractCode}`;
  if (qtyMap[qtyKey] === qty) {
    return;
  }
  try {
    localStorage.setItem(qtyKey, qty);
    qtyMap[qtyKey] = qty;
  } catch (err) {}
};

const getDefaultQty = (widgetName, contractCode) => {
  try {
    const qty = localStorage.getItem(`${qtyPresetPrefix}-${widgetName}-${contractCode}`);
    return Number.isNaN(qty) || !qty ? false : Number(qty);
  } catch (err) {
    return false;
  }
};

const mapStateToProps = (state, { contract: { contractCode } }) => ({
  isInOutage: selectIsInOutage(state),
  presetDefault: selectTradeModeDefault(state, contractCode),
});

class TradeModeProvider extends Component {
  static propTypes = {
    cancelOrdersByIds: PropTypes.func.isRequired,
    cancelOrdersInLevel: PropTypes.func.isRequired,
    cancelOrdersBySide: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    closePosition: PropTypes.func.isRequired,
    contract: PropTypes.object.isRequired,
    defaultEnabled: PropTypes.bool.isRequired,
    classPrefix: PropTypes.string.isRequired,
    isInOutage: PropTypes.bool,
    isLoggedIn: PropTypes.bool,
    onToggle: PropTypes.func,
    orderEntryContext: PropTypes.shape({ handleSubmit: PropTypes.func.isRequired }),
    showOrderTypeRadio: PropTypes.bool,
    updateOrderLevel: PropTypes.func.isRequired,
    updateOrderPriceInLevel: PropTypes.func.isRequired,
    widget: PropTypes.string,
  };

  static defaultProps = {
    defaultEnabled: false,
  };

  constructor(props) {
    super(props);
    const {
      cancelOrdersByIds,
      cancelOrdersInLevel,
      cancelOrdersBySide,
      closePosition,
      contract,
      showOrderTypeRadio,
      updateOrderLevel,
      updateOrderPriceInLevel,
      widget,
    } = this.props;

    this.state = {
      contract,
      closePosition,
      cancelOrdersByIds,
      cancelOrdersInLevel,
      cancelOrdersBySide,
      handleSubmitOrder: this.handleSubmitOrder,
      handleOrderQuantityChange: this.handleOrderQuantityChange,
      handleOrderTypeChange: this.handleOrderTypeChange,
      handleOrderUpdate: this.handleOrderUpdate,
      classPrefix: props.classPrefix,
      isInOutage: props.isInOutage,
      isLoggedIn: props.isLoggedIn,
      logEvent: props.logEvent,
      orderQuantity: {
        value:
          getDefaultQty(widget, contract.contractCode) ||
          (Number.isNaN(props.presetDefault) ? 0 : props.presetDefault),
      },
      orderType: ORDER_TYPE.LIMIT,
      quantityIsValid: true,
      showOrderTypeRadio,
      toggleTradeMode: this.toggleTradeMode,
      tradeEnabled: props.isLoggedIn ? props.defaultEnabled : false,
      updateOrderLevel,
      updateOrderPriceInLevel,
      widget,
    };
  }

  componentDidUpdate(
    {
      isInOutage: wasInOutage,
      contract: { contractCode: prevContractCode },
      presetDefault: prevPresetDefault,
    },
    { tradeEnabled: prevTradeEnabled }
  ) {
    const {
      contract,
      contract: { contractCode },
      isInOutage,
      presetDefault,
      widget,
    } = this.props;
    const { tradeEnabled } = this.state;
    if (contractCode !== prevContractCode) {
      this.setState({
        contract: contract,
        orderQuantity: { value: getDefaultQty(widget, contractCode) || presetDefault },
        isInOutage: isInOutage,
      });
    } else if (!wasInOutage && isInOutage) {
      this.setState({ isInOutage: true, tradeEnabled: false });
    } else if (wasInOutage && !isInOutage) {
      this.setState({ isInOutage: false });
    } else if (!prevTradeEnabled && tradeEnabled) {
      this.handleOrderQuantityChange({
        value: getDefaultQty(widget, contractCode) || presetDefault,
      });
    } else if (prevPresetDefault === 0 && presetDefault !== 0 && !Number.isNaN(presetDefault)) {
      this.handleOrderQuantityChange({ value: presetDefault });
    }
  }

  toggleTradeMode = () => {
    const { isLoggedIn, onToggle } = this.props;

    if (!isLoggedIn) {
      return;
    }

    this.setState(
      { tradeEnabled: !this.state.tradeEnabled },
      () => onToggle && onToggle(this.state.tradeEnabled)
    );
  };

  handleOrderUpdate = ({ price, ...order }) => {
    const {
      contract: { priceDecimals },
      updateOrder,
    } = this.props;

    updateOrder({ ...order, price: toPriceString(price, priceDecimals) });
  };

  handleOrderTypeChange = ({ target: { value: orderType } }) => this.setState({ orderType });

  handleOrderQuantityChange = orderQuantity => {
    const value = Number.isNaN(orderQuantity.value) ? 0 : Number(orderQuantity.value);

    this.setState(
      {
        orderQuantity: { value },
        quantityIsValid: isQuantityValid(orderQuantity.value),
      },
      () => setDefaultQty(this.props.widget, this.props.contract.contractCode, orderQuantity.value)
    );
  };

  handleSubmitOrder = ({ price, side, stopPrice, type: orderType, reduceOnly }) => {
    const {
      contract,
      contract: { contractCode, isExpired },
      logEvent,
      orderEntryContext: { handleSubmit },
      widget,
    } = this.props;

    if (isExpired) {
      return AlertService.error('Cannot place orders for expired contract.');
    }

    const {
      orderQuantity: { value: size },
    } = this.state;

    logEvent({
      action: EVENT_ACTIONS.CREATE_ORDER_INITIATE,
      type: EVENT_TYPES.CLICK,
      isMobile: false,
      orderInfo: { price, reduceOnly, side, size, stopPrice, orderType, contractCode },
      widget,
    });
    handleSubmit({ price, reduceOnly, size, stopPrice, orderType, contract }, { side });
  };

  render() {
    return (
      <TradeModeContext.Provider value={this.state}>
        {this.props.children}
      </TradeModeContext.Provider>
    );
  }
}

export default connect(mapStateToProps)(TradeModeProvider);
