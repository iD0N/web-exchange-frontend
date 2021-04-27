import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { TradeModeConsumer } from '../../../trade-mode/Context'; // TODO uplift
import TradeModeToolbar from '../../../trade-mode/components/ToolBar'; // TODO uplift
import { selectLastPrice, selectOrderLevels } from '../../ducks';

import TradeFromChart from './component';

const mapStateToProps = state => ({
  orderLevels: selectOrderLevels(state),
  lastPrice: selectLastPrice(state),
});

class TradeFromChartContainer extends Component {
  static propTypes = {
    lastPrice: PropTypes.number.isRequired,
    minimumPriceIncrement: PropTypes.string.isRequired,
    orderLevels: PropTypes.array.isRequired,
  };

  render() {
    const {
      chartReady,
      getPriceHovered,
      lastPrice,
      minimumPriceIncrement,
      orderLevels,
      isMobile,
    } = this.props;

    return (
      <TradeModeConsumer>
        {({
          cancelOrdersByIds,
          contract: { contractCode, priceDecimals, sizeDecimals },
          handleOrderUpdate,
          handleSubmitOrder,
          logEvent,
          orderQuantity: { value },
          tradeEnabled,
          updateOrderPriceInLevel,
        }) =>
          tradeEnabled && (
            <div className="chart-trade-mode-outer">
              <TradeModeToolbar />
              {chartReady && !!lastPrice && (
                <TradeFromChart
                  contractCode={contractCode}
                  lastPrice={lastPrice}
                  logEvent={logEvent}
                  minimumPriceIncrement={minimumPriceIncrement}
                  onCancelOrdersByIds={cancelOrdersByIds}
                  onOrderSubmit={handleSubmitOrder}
                  onUpdateOrderPriceInLevel={updateOrderPriceInLevel}
                  orderLevels={orderLevels}
                  priceDecimals={priceDecimals}
                  quantity={value}
                  sizeDecimals={sizeDecimals}
                  isMobile={isMobile}
                  getPriceHovered={getPriceHovered}
                />
              )}
            </div>
          )
        }
      </TradeModeConsumer>
    );
  }
}

export default connect(mapStateToProps)(TradeFromChartContainer);
