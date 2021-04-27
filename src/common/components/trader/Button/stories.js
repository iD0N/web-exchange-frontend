import React from 'react';
import { storiesOf } from '@storybook/react';

import Row from '../../../../../.storybook/addons/Row';

import { Button, Value } from '../';

storiesOf('Trader/Button', module)
  .add('default', () => <Button>Default</Button>)
  .add('primary', () => <Button type="primary">Primary</Button>)
  .add('ghost', () => <Button ghost>Ghost</Button>)
  .add('icon', () => (
    <>
      <Row>
        <Value label="small">
          <Button icon="plus" size="small" />
        </Value>
      </Row>
      <Row>
        <Value label="default">
          <Button icon="plus" />
        </Value>
      </Row>
      <Row>
        <Value label="large">
          <Button icon="plus" size="large" />
        </Value>
      </Row>
    </>
  ))
  .add('link', () => (
    <>
      <Row>
        <Button link size="small">
          small link button
        </Button>
      </Row>
      <Row>
        <Button link>link button</Button>
      </Row>
      <Row>
        <Button link size="large">
          large link button
        </Button>
      </Row>
      <Row>
        <Button link disabled>
          disabled
        </Button>
      </Row>
      <Row>
        <Button link block>
          block
        </Button>
      </Row>
    </>
  ))
  .add('negative', () => (
    <>
      <Row>
        <Value label="default">
          <Button type="negative">Sell</Button>
        </Value>
      </Row>
      <Row>
        <Value label="ghost">
          <Button type="negative" ghost>
            Sell
          </Button>
        </Value>
      </Row>
    </>
  ))
  .add('positive', () => (
    <>
      <Row>
        <Value label="default">
          <Button type="positive">Buy</Button>
        </Value>
      </Row>
      <Row>
        <Value label="ghost">
          <Button type="positive" ghost>
            Buy
          </Button>
        </Value>
      </Row>
    </>
  ))
  .add('plain', () => (
    <>
      <Row>
        <Value label="plain">
          <Button plain>Without border & dimmed text</Button>
        </Value>
      </Row>
    </>
  ))
  .add('upper', () => (
    <>
      <Row>
        <Value label="uppercased">
          <Button upper>Text</Button>
        </Value>
      </Row>
    </>
  ));
