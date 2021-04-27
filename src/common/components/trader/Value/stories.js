import React from 'react';
import { storiesOf } from '@storybook/react';

import Row from '../../../../../.storybook/addons/Row';

import Value from './';

storiesOf('Trader/Value', module)
  .add('text', () => (
    <Value label="Label">
      <Value.Text>String</Value.Text>
    </Value>
  ))
  .add('numeric', () => (
    <>
      <Row>
        <Value label="currency">
          <Value.Numeric type="currency" value={123456789.65} />
        </Value>
      </Row>
      <Row>
        <Value label="percentage">
          <Value.Numeric type="percentage" value={0.7815} />
        </Value>
      </Row>
      <Row>
        <Value label="token">
          <Value.Numeric type="token" value={123456.98765} />
        </Value>
      </Row>
      <Row>
        <Value label="size">
          <Value.Numeric type="size" value={5645661516} />
        </Value>
      </Row>
      <Row>
        <Value label="price">
          <Value.Numeric type="price" value={30.126} />
        </Value>
      </Row>
      <Row>
        <Value label="price up">
          <Value.Numeric type="price" direction="up" value={30.126} />
        </Value>
      </Row>
      <Row>
        <Value label="price down">
          <Value.Numeric type="price" direction="down" value={30.126} />
        </Value>
      </Row>
      <Row>
        <Value label="price up with icon">
          <Value.Numeric type="price" direction="up" withIcon value={30.126} />
        </Value>
      </Row>
      <Row>
        <Value label="price down with icon">
          <Value.Numeric type="price" direction="down" withIcon value={30.126} />
        </Value>
      </Row>
    </>
  ))
  .add('date', () => (
    <>
      <Row>
        <Value label="time">
          <Value.Date type="time" value={new Date()} />
        </Value>
      </Row>
      <Row>
        <Value label="month">
          <Value.Date type="month" value={new Date()} />
        </Value>
      </Row>
      <Row>
        <Value label="datetime">
          <Value.Date type="datetime" value={new Date()} />
        </Value>
      </Row>
    </>
  ));
