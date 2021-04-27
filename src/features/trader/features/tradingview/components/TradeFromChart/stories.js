import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import ChartDecorator from '../../../../../../../.storybook/addons/ChartDecorator';

import { connectChartContext } from '../..//ChartContext';
import TradeFromChart from './component';

const Story = connectChartContext()(TradeFromChart);

const order = {
  contractCode: 'BTCZ18',
  orderCount: 1,
  orderId: 'f7105f8b-2970-45a5-b454-51fb16cd47fc',
  orderType: 'limit',
  createdAt: '2018-12-17T21:40:25.521Z',
  price: '44.8',
  side: 'buy',
  size: '1.0000',
  sizeFilled: '0.0000',
  status: 'accepted',
};

const orderLevelsMap = {
  '3950': {
    take_market: {
      levelKey: 'take_market-sell-3950.00',
      orderType: 'take_market',
      price: '3950.00',
      side: 'sell',
      size: '1.0000',
      sizeFilled: '0.0000',
      sizeRemaining: '1',
      orders: [
        {
          averageFillPrice: null,
          contractCode: 'BTCF19',
          createdAt: '2019-01-30T12:35:27.774Z',
          orderId: '60699d44-7995-4010-bbe6-922ac99e1ad9',
          orderType: 'take_market',
          price: '3950.00',
          side: 'sell',
          size: '1.0000',
          sizeFilled: '0.0000',
          status: 'accepted',
          stopPrice: '4000.00',
        },
      ],
    },
  },
  '4000': {
    limit: {
      levelKey: 'limit-sell-4000.00',
      orderType: 'limit',
      price: '4000.00',
      side: 'sell',
      size: '5.0000',
      sizeFilled: '0.0000',
      sizeRemaining: '5',
      orders: [
        {
          averageFillPrice: null,
          contractCode: 'BTCF19',
          createdAt: '2019-01-29T16:16:00.790Z',
          orderId: 'a9996bb8-efe9-41fd-8509-7fe68be49b93',
          orderType: 'limit',
          price: '4000.00',
          side: 'sell',
          size: '5.0000',
          sizeFilled: '0.0000',
          status: 'accepted',
        },
      ],
    },
  },
};

storiesOf('Trader/Chart/TradeFromChart', module)
  .addDecorator(ChartDecorator)
  .add('default', () => (
    <Story
      contractCode="BTCZ18"
      lastPrice={44.72}
      minimumPriceIncrement="0.5"
      orderLevels={Object.entries(orderLevelsMap)}
      onCancelOrdersByIds={action('onCancelOrdersByIds')}
      onOrderSubmit={action('submitOrder')}
      onUpdateOrderPriceInLevel={action('orderUpdate')}
      sizeDecimals={4}
      quantity={150}
    />
  ));
