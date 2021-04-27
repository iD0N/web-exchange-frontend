import React from 'react';
import { storiesOf } from '@storybook/react';

import { Popover, Button, Tabs } from '../';

storiesOf('Trader/Popover', module)
  .add('default', () => (
    <Popover title="Hello" content={<p>World</p>}>
      <Button>Toggle</Button>
    </Popover>
  ))
  .add('with close icon', () => (
    <Popover title="Hello" content={<p>World</p>} showCloseIcon>
      <Button>Toggle</Button>
    </Popover>
  ))
  .add('with tabs', () => {
    const TABS = {
      ONE: 'ONE',
      TWO: 'TWO',
      THREE: 'THREE',
    };

    const TABS_T = {
      [TABS.ONE]: 'One',
      [TABS.TWO]: 'Two',
      [TABS.THREE]: 'Three',
    };

    return (
      <Tabs.WithTabs defaultKey={TABS.ONE} tabs={TABS} tabsT={TABS_T}>
        {({ activeKey }) => (
          <Popover trigger="click" showCloseIcon title={<Tabs />} content={activeKey}>
            <Button>Open</Button>
          </Popover>
        )}
      </Tabs.WithTabs>
    );
  });
