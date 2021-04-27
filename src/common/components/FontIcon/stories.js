import React from 'react';
import { storiesOf } from '@storybook/react';

import FontIcon from './';

const Example = ({ type }) => (
  <div style={{ width: '20%', textAlign: 'center', padding: 20 }}>
    <FontIcon type={type} style={{ fontSize: '48px', display: 'block' }} />
    <label>{type}</label>
  </div>
);

storiesOf('FontIcon', module).add('grid', () => (
  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
    <Example type="alert" />
    <Example type="arrow-down" />
    <Example type="arrow-up" />
    <Example type="calendar" />
    <Example type="center" />
    <Example type="chart" />
    <Example type="checkmark" />
    <Example type="chev-down" />
    <Example type="chev-up" />
    <Example type="close" />
    <Example type="copy" />
    <Example type="crosshair" />
    <Example type="delete" />
    <Example type="deposit" />
    <Example type="dom" />
    <Example type="edit" />
    <Example type="info" />
    <Example type="interface" />
    <Example type="logout-copy" />
    <Example type="menu-copy" />
    <Example type="minus" />
    <Example type="notification" />
    <Example type="order-book" />
    <Example type="orders" />
    <Example type="plus" />
    <Example type="positions" />
    <Example type="reports" />
    <Example type="search" />
    <Example type="settings" />
    <Example type="sign-1" />
    <Example type="sign-2" />
    <Example type="sign-3" />
    <Example type="sign-4" />
    <Example type="sign-5" />
    <Example type="time-n-sales" />
    <Example type="trading" />
    <Example type="watchlist" />
    <Example type="withdrawal" />
    <Example type="sorting" />
    <Example type="menu" />
    <Example type="drag" />
    <Example type="link-to" />
    <Example type="arrow-back" />
    <Example type="attachment" />
    <Example type="sorting-2" />
    <Example type="chev-left" />
    <Example type="chev-right" />
    <Example type="dragadd" />
    <Example type="marquee" />
  </div>
));
