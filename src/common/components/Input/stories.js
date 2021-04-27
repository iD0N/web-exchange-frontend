import React from 'react';
import { storiesOf } from '@storybook/react';

import { Widget, Form, Input } from '../';

storiesOf('Input', module).add('default', () => (
  <Widget title="Input states">
    <Form>
      <Form.Item label="First name">
        <Input placeholder="What's your name?" />
      </Form.Item>
      <Form.Item floating label="Label" validateStatus="error" help="Invalid value">
        <Input placeholder="Enter value" />
      </Form.Item>
      <Form.Item floating label="Disabled">
        <Input disabled defaultValue="can't touch this" />
      </Form.Item>
    </Form>
  </Widget>
));
