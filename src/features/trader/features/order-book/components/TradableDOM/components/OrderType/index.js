import React, { memo } from 'react';

import { ORDER_TYPE_ABBREVIATIONS } from '../../../../../../constants';
import { TradeModeConsumer } from '../../../../../trade-mode/Context'; // TODO uplift

const OrderType = () => (
  <TradeModeConsumer>
    {({ orderType }) => (
      <span className="order-type-label">({ORDER_TYPE_ABBREVIATIONS[orderType]})</span>
    )}
  </TradeModeConsumer>
);

export default memo(OrderType);
