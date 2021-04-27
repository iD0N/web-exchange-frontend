import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { Spin, IsMobile } from '../../../../../../common/components';
import { GridLayoutTile, WidgetHeader } from '../../../../components';
import TradeModeToggle from '../../../trade-mode/components/TradeModeToggle'; // TODO uplift

import OrderBookTable from '../OrderBookTable';
import TradableDOM from '../TradableDOM';
import OrderBookFooter from '../OrderBookFooter';

const OrderBook = ({ isMobile, isLoading, toggleTradeMode, tradeEnabled }) => (
  <div className="order-book">
    <Spin spinning={isLoading}>
      <GridLayoutTile
        controls={!isMobile && <TradeModeToggle onToggle={toggleTradeMode} />}
        content={tradeEnabled ? <TradableDOM /> : <OrderBookTable />}
        footer={<OrderBookFooter />}
        title={<WidgetHeader title={<Trans i18nKey="trader.orderBook.title">Order Book</Trans>} />}
      />
    </Spin>
  </div>
);

OrderBook.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
  toggleTradeMode: PropTypes.func.isRequired,
  tradeEnabled: PropTypes.bool.isRequired,
};

export default IsMobile(OrderBook);
