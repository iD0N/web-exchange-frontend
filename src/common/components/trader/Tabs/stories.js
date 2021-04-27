import React from 'react';
import { storiesOf } from '@storybook/react';

import Tabs from './';

const { WithTabs } = Tabs;

const TABS = {
  ORDERS: 'ORDERS',
  ORDER_HISTORY: 'ORDER_HISTORY',
};

const TABS_T = {
  [TABS.ORDERS]: 'Orders',
  [TABS.ORDER_HISTORY]: 'Order History',
};

storiesOf('Trader/Tabs', module).add('default', () => (
  <WithTabs defaultKey={TABS.ORDERS} tabs={TABS} tabsT={TABS_T}>
    {({ activeKey }) => (
      <div>
        <Tabs />
        {activeKey === TABS.ORDERS ? 'Tab 1' : 'Tab 2'}
      </div>
    )}
  </WithTabs>
));
