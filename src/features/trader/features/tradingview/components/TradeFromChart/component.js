import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import OpenOrders from './components/OpenOrders';
import ChartOrderPopover from './components/ChartOrderPopover';

let shouldSuppressModal = false;
const suppressModal = () => {
  shouldSuppressModal = true;
  setTimeout(() => {
    shouldSuppressModal = false;
  }, 100);
};
const getShouldSuppressModal = () => shouldSuppressModal;

export default class TradeFromChart extends Component {
  static propTypes = {
    contractCode: PropTypes.string.isRequired,
    lastPrice: PropTypes.number.isRequired,
    logEvent: PropTypes.func,
    minimumPriceIncrement: PropTypes.string.isRequired,
    orderLevels: PropTypes.array.isRequired,
    quantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    onCancelOrdersByIds: PropTypes.func.isRequired,
    onOrderSubmit: PropTypes.func.isRequired,
    onUpdateOrderPriceInLevel: PropTypes.func.isRequired,
    sizeDecimals: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
    this.tfcRef = React.createRef();
  }

  componentDidMount() {
    this.tfcRef.current.onmousedown = e => {
      if (e.target !== this.tfcRef.current) {
        return;
      }
      setTimeout(() => {
        this.setState({ visible: false });
      }, 20);
    };

    window.tvWidget.closePopupsAndDialogs();
    window.tvWidget.applyOverrides({
      'paneProperties.legendProperties.showSeriesOHLC': false,
      'paneProperties.legendProperties.showLegend': false,
    });
  }

  componentDidUpdate({ contractCode: prevContractCode }) {
    if (prevContractCode !== this.props.contractCode) {
      this.setState({ visible: false });
    }
  }

  render() {
    const {
      contractCode,
      lastPrice,
      logEvent,
      minimumPriceIncrement,
      orderLevels,
      priceDecimals,
      quantity,
      onCancelOrdersByIds,
      onUpdateOrderPriceInLevel,
      onOrderSubmit,
      sizeDecimals,
      isMobile,
      getPriceHovered,
    } = this.props;

    const { clientWidth, clientHeight } =
      !!window.tvWidget && window.tvWidget._iFrame ? window.tvWidget._iFrame : {};
    const popoverStyle =
      clientWidth || clientHeight ? { width: `${clientWidth}px`, height: `${clientHeight}px` } : {};

    return (
      <div
        ref={this.tfcRef}
        className={cn('trade-from-chart', { 'trade-from-chart-visible': this.state.visible })}
        style={popoverStyle}
      >
        <ChartOrderPopover
          lastPrice={lastPrice}
          priceDecimals={priceDecimals}
          quantity={quantity}
          minimumPriceIncrement={minimumPriceIncrement}
          sizeDecimals={sizeDecimals}
          submitOrder={onOrderSubmit}
          getPriceHovered={getPriceHovered}
          setVisible={visible => this.setState({ visible })}
          getShouldSuppressModal={getShouldSuppressModal}
        />
        <OpenOrders
          contractCode={contractCode}
          lastPrice={lastPrice}
          logEvent={logEvent}
          minimumPriceIncrement={minimumPriceIncrement}
          orderLevels={orderLevels}
          onCancelOrdersByIds={onCancelOrdersByIds}
          onUpdateOrderPriceInLevel={onUpdateOrderPriceInLevel}
          priceDecimals={priceDecimals}
          sizeDecimals={sizeDecimals}
          isMobile={isMobile}
          suppressModal={suppressModal}
        />
      </div>
    );
  }
}
