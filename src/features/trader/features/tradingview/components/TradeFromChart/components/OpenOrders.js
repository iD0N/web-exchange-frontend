import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { ORDER_SIDE } from '../../../../../../../common/enums';
import { ORDER_TYPE_ABBREVIATIONS_TFC } from '../../../../../constants';

const ORDER_SIDE_COLOR = {
  [ORDER_SIDE.BUY]: '#33d68a',
  [ORDER_SIDE.SELL]: '#fc6058',
};

const orderLines = {};

export default class OpenOrders extends Component {
  static propTypes = {
    contractCode: PropTypes.string.isRequired,
    minimumPriceIncrement: PropTypes.string.isRequired,
    orderLevels: PropTypes.array.isRequired,
    onCancelOrdersByIds: PropTypes.func.isRequired,
    onUpdateOrderPriceInLevel: PropTypes.func.isRequired,
    sizeDecimals: PropTypes.number.isRequired,
  };

  componentDidMount() {
    this.reRenderOrderLines();
  }

  componentDidUpdate({ contractCode: prevContractCode, orderLevels: prevOrderLevels }) {
    if (
      this.props.orderLevels !== prevOrderLevels ||
      this.props.contractCode !== prevContractCode
    ) {
      this.reRenderOrderLines();
    }
  }

  componentWillUnmount() {
    const { contractCode, isMobile } = this.props;

    Object.keys(orderLines[contractCode] || {}).forEach(orderLineId => {
      orderLines[contractCode][orderLineId].remove();
      delete orderLines[contractCode][orderLineId];
    });
    try {
      window.tvWidget.applyOverrides({
        'paneProperties.legendProperties.showSeriesOHLC': !isMobile,
        'paneProperties.legendProperties.showLegend': !isMobile,
      });
    } catch(err) {}
  }

  reRenderOrderLines = () => {
    const {
      contractCode,
      onCancelOrdersByIds,
      onUpdateOrderPriceInLevel,
      suppressModal,
    } = this.props;

    if (orderLines[contractCode] && Object.keys(orderLines[contractCode]).length > 0) {
      Object.keys(orderLines[contractCode]).forEach(orderLineId => {
        orderLines[contractCode][orderLineId].remove();
        delete orderLines[contractCode][orderLineId];
      });
    }

    if (!orderLines[contractCode]) {
      orderLines[contractCode] = {};
    }
    try {
      this.props.orderLevels.forEach(([priceLevel, typeMap]) => {
        Object.entries(typeMap).forEach(([type, orderLevel]) => {
          const { levelKey, price, side, sizeRemaining } = orderLevel;
          orderLines[contractCode][levelKey] = window.tvWidget
            .chart()
            .createOrderLine({ disableUndo: true })
            .setText(ORDER_TYPE_ABBREVIATIONS_TFC[type])
            .setQuantity(sizeRemaining)
            .setPrice(price)
            .onMove(function() {
              const { text: newPrice } = this._line._priceAxisView._rendererData;

              onUpdateOrderPriceInLevel({
                orders: this.orderLevel.orders,
                price: window.tvWidget
                  .chart()
                  .priceFormatter()
                  .format(newPrice),
              });
              suppressModal();
            })
            .onModify(() => {
              suppressModal();
            })
            .onCancel(function() {
              onCancelOrdersByIds({
                orderIds: this.orderLevel.orders.map(({ orderId }) => orderId),
              });
              suppressModal();
            })
            .setExtendLeft(false)
            .setBodyTextColor('#000')
            .setQuantityTextColor('#000')
            .setCancelButtonIconColor('#000')
            .setLineWidth(1);

          if (side === 'buy') {
            orderLines[contractCode][levelKey].setBodyBackgroundColor(
              ORDER_SIDE_COLOR[ORDER_SIDE.BUY]
            );
            orderLines[contractCode][levelKey].setBodyBorderColor('#000');
            orderLines[contractCode][levelKey].setLineColor(ORDER_SIDE_COLOR[ORDER_SIDE.BUY]);
            orderLines[contractCode][levelKey].setQuantityBorderColor(
              ORDER_SIDE_COLOR[ORDER_SIDE.BUY]
            );
            orderLines[contractCode][levelKey].setQuantityBackgroundColor(
              ORDER_SIDE_COLOR[ORDER_SIDE.BUY]
            );
            orderLines[contractCode][levelKey].setCancelButtonBorderColor(
              ORDER_SIDE_COLOR[ORDER_SIDE.BUY]
            );
            orderLines[contractCode][levelKey].setCancelButtonBackgroundColor(
              ORDER_SIDE_COLOR[ORDER_SIDE.BUY]
            );
          } else {
            // sell
            orderLines[contractCode][levelKey].setBodyBackgroundColor(
              ORDER_SIDE_COLOR[ORDER_SIDE.SELL]
            );
            orderLines[contractCode][levelKey].setBodyBorderColor('#000');
            orderLines[contractCode][levelKey].setLineColor(ORDER_SIDE_COLOR[ORDER_SIDE.SELL]);
            orderLines[contractCode][levelKey].setQuantityBorderColor(
              ORDER_SIDE_COLOR[ORDER_SIDE.SELL]
            );
            orderLines[contractCode][levelKey].setQuantityBackgroundColor(
              ORDER_SIDE_COLOR[ORDER_SIDE.SELL]
            );
            orderLines[contractCode][levelKey].setCancelButtonBorderColor(
              ORDER_SIDE_COLOR[ORDER_SIDE.SELL]
            );
            orderLines[contractCode][levelKey].setCancelButtonBackgroundColor(
              ORDER_SIDE_COLOR[ORDER_SIDE.SELL]
            );
          }

          orderLines[contractCode][levelKey].orderLevel = orderLevel;
        });
      });
    } catch (err) {}
  };

  render() {
    return <div />;
  }
}
