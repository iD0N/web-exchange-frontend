import React from 'react';
import { storiesOf } from '@storybook/react';

import Row from '../../../../.storybook/addons/Row';

import Button from './';

storiesOf('Button', module)
  .add('default', () => (
    <>
      <Row>
        <Button>Default</Button>
      </Row>
      <Row>
        <Button disabled>Disabled</Button>
      </Row>
      <Row>
        <Button block>Block button</Button>
      </Row>
    </>
  ))
  .add('primary', () => (
    <>
      <Row>
        <Button type="primary">Primary</Button>
      </Row>
      <Row>
        <Button loading type="primary">
          Loading
        </Button>
      </Row>
      <Row>
        <Button disabled type="primary">
          Disabled
        </Button>
      </Row>
      <Row>
        <Button block type="primary" className="custom-class">
          Primary block button
        </Button>
      </Row>
    </>
  ))
  .add('ghost', () => (
    <>
      <Row>
        <Button ghost>default</Button>
      </Row>
      <Row>
        <Button ghost disabled>
          disabled
        </Button>
      </Row>
      <Row>
        <Button ghost block>
          block
        </Button>
      </Row>
      <Row>
        <Button ghost type="primary">
          default
        </Button>
      </Row>
      <Row>
        <Button ghost disabled type="primary">
          disabled
        </Button>
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
  ));
