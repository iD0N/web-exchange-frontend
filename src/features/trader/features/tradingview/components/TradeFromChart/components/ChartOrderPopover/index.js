import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';

import { ORDER_SIDE, ORDER_TYPE } from '../../../../../../../../common/enums';
import { Button, Popover, Value } from '../../../../../../../../common/components/trader';
import { ORDER_TYPE_ABBREVIATIONS_TFC } from '../../../../../../constants';
import { getOrderSide } from '../../../../../order-book/utils'; // TODO uplift
import { LEVEL_SIDES } from '../../../../../order-book/utils/constants'; // TODO uplift

let mouseDownAt = 0;
const mouseDownCoords = { x: 0, y: 0 };

const isValidClick = (x, y, time) => {
  if (time - mouseDownAt > 200) {
    return false;
  }
  const dist = Math.hypot(x - mouseDownCoords.x, y - mouseDownCoords.y);
  return dist < 50;
};

export default class ChartOrderPopover extends Component {
  static propTypes = {
    minimumPriceIncrement: PropTypes.string.isRequired,
    quantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    sizeDecimals: PropTypes.number.isRequired,
    submitOrder: PropTypes.func.isRequired,
    setVisible: PropTypes.func.isRequired,
  };

  state = {
    visible: false,
    positionTop: 0,
    positionLeft: 0,
    priceLevel: 0,
  };

  componentWillMount() {
    window.tvWidget.subscribe('mouse_down', this.handleMouseDown);
    window.tvWidget.subscribe('mouse_up', this.handleMouseUp);
  }

  componentWillUnmount() {
    try {
      window.tvWidget.unsubscribe('mouse_down', this.handleMouseDown);
      window.tvWidget.unsubscribe('mouse_up', this.handleMouseUp);
    } catch (err) {}

    mouseDownAt = 0;
    mouseDownCoords.x = 0;
    mouseDownCoords.y = 0;
  }

  handleMouseDown = ({ clientX, clientY }) => {
    mouseDownAt = Date.now();
    mouseDownCoords.x = clientX;
    mouseDownCoords.y = clientY;
  };

  handleMouseUp = ({ clientX, clientY }) => {
    if (!BigNumber(this.props.quantity).isGreaterThan(0)) {
      return;
    }

    const shouldShowModal = isValidClick(clientX, clientY, Date.now());
    if (!shouldShowModal) {
      return;
    }
    const { getPriceHovered, getShouldSuppressModal } = this.props;
    if (getShouldSuppressModal()) {
      return;
    }

    const price = getPriceHovered();
    const formattedPrice = window.tvWidget
      .chart()
      .priceFormatter()
      .format(price);

    this.setState(
      {
        visible: true,
        priceLevel: formattedPrice,
        positionTop: clientY,
        positionLeft: clientX,
      },
      () => {
        this.props.setVisible(true);
      }
    );
  };

  handleOrderClick = type => {
    this.setState({ visible: false }, () => {
      this.props.setVisible(false);
      this.props.submitOrder({
        ...(type === ORDER_TYPE.LIMIT
          ? { price: this.state.priceLevel, reduceOnly: false }
          : { stopPrice: this.state.priceLevel, reduceOnly: true }),
        side: getOrderSide(type, this.getLevelSide()),
        type,
      });
    });
  };

  getLevelSide = () =>
    this.props.lastPrice > this.state.priceLevel ? LEVEL_SIDES.BID : LEVEL_SIDES.ASK;

  getOrderSide = () =>
    this.props.lastPrice > this.state.priceLevel ? ORDER_SIDE.BID : ORDER_SIDE.ASK;

  renderOrderButtons = side =>
    [ORDER_TYPE.LIMIT, ORDER_TYPE.STOP_MARKET, ORDER_TYPE.TAKE_MARKET].map(orderType => {
      const orderSide = getOrderSide(orderType, this.getLevelSide());

      return (
        <Button
          key={orderType}
          size="small"
          className={`tfc-${ORDER_TYPE_ABBREVIATIONS_TFC[
            orderType
          ].toLowerCase()}-${orderSide.toLowerCase()}`}
          type={orderSide === ORDER_SIDE.BUY ? 'positive' : 'negative'}
          upper
          onClick={() => this.handleOrderClick(orderType)}
        >
          <div>
            {ORDER_TYPE_ABBREVIATIONS_TFC[orderType]} {orderSide}{' '}
            <Value.Numeric
              type="size"
              decimals={this.props.sizeDecimals}
              value={this.props.quantity}
            />
          </div>
        </Button>
      );
    });

  render() {
    const { visible, positionTop, positionLeft, priceLevel } = this.state;
    const { priceDecimals } = this.props;

    return (
      <Popover
        content={this.renderOrderButtons()}
        getPopupContainer={() => document.querySelector('.trade-from-chart')}
        overlayClassName="chart-order-entry"
        placement="bottom"
        title={<Value.Numeric type="price" value={priceLevel} decimals={priceDecimals} />}
        visible={visible && BigNumber(this.props.quantity).isGreaterThan(0)}
      >
        <div style={{ position: 'absolute', left: positionLeft, top: positionTop }} />
      </Popover>
    );
  }
}
