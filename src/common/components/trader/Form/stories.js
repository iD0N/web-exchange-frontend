import React from 'react';
import { storiesOf } from '@storybook/react';

import { Form, Input, InputNumber, Select, Checkbox, CheckboxSwitch, Radio } from '../';

const { Option } = Select;

storiesOf('Trader/Form/FormItem', module)
  .add('Text', () => (
    <Form layout="vertical">
      <Form.Item label="City">
        <span className="trader-form-text">Chicago</span>
      </Form.Item>
    </Form>
  ))
  .add('Input', () => (
    <Form layout="vertical">
      <Form.Item label="Empty">
        <Input placeholder="00.00" />
      </Form.Item>
      <Form.Item label="Filled">
        <Input value="00.00" />
      </Form.Item>
      <Form.Item label="Disabled empty">
        <Input placeholder="00.00" disabled />
      </Form.Item>
      <Form.Item label="Disabled filled">
        <Input value="00.00" disabled />
      </Form.Item>
    </Form>
  ))
  .add('InputNumber', () => (
    <Form layout="vertical">
      <Form.Item label="Empty">
        <InputNumber placeholder="0" />
      </Form.Item>
      <Form.Item label="Filled">
        <InputNumber defaultValue="5" />
      </Form.Item>
      <Form.Item label="Disabled empty">
        <InputNumber placeholder="0" disabled />
      </Form.Item>
      <Form.Item label="Disabled filled">
        <InputNumber defaultValue="5" disabled />
      </Form.Item>
    </Form>
  ))

  .add('Select', () => (
    <Form layout="vertical">
      <Form.Item label="empty">
        <Select placeholder="Empty" />
      </Form.Item>
      <Form.Item label="filled">
        <Select defaultValue="symbol">
          <Option value="symbol">Symbol</Option>
        </Select>
      </Form.Item>
      <Form.Item label="Disabled empty">
        <Select placeholder="Empty" disabled>
          <Option value="symbol">Symbol</Option>
        </Select>
      </Form.Item>
      <Form.Item label="Disabled filled">
        <Select defaultValue="symbol" disabled>
          <Option value="symbol">Symbol</Option>
        </Select>
      </Form.Item>
      <Form.Item label="borderless">
        <Select borderless defaultValue="symbol">
          <Option value="symbol">Symbol</Option>
        </Select>
      </Form.Item>
    </Form>
  ))
  .add('Checkbox', () => (
    <Form layout="vertical">
      <Form.Item label="Default">
        <Checkbox>Default</Checkbox>
      </Form.Item>
      <Form.Item label="Checked">
        <Checkbox checked>Checked</Checkbox>
      </Form.Item>
      <Form.Item label="Disabled">
        <Checkbox disabled>Disabled</Checkbox>
      </Form.Item>
      <Form.Item label="Checked Disabled">
        <Checkbox checked disabled>
          Checked Disabled
        </Checkbox>
      </Form.Item>
    </Form>
  ))
  .add('CheckboxSwitch', () => (
    <Form layout="vertical">
      <Form.Item label="Default">
        <CheckboxSwitch>Default</CheckboxSwitch>
      </Form.Item>
      <Form.Item label="Checked">
        <CheckboxSwitch checked>Checked</CheckboxSwitch>
      </Form.Item>
      <Form.Item label="Disabled">
        <CheckboxSwitch disabled>Disabled</CheckboxSwitch>
      </Form.Item>
      <Form.Item label="Checked Disabled">
        <CheckboxSwitch checked disabled>
          Checked Disabled
        </CheckboxSwitch>
      </Form.Item>
      <Form.Item label="Inverted">
        <CheckboxSwitch labelPlacement="left">Checked Disabled</CheckboxSwitch>
      </Form.Item>
      <Form.Item label="Small">
        <CheckboxSwitch size="small">Checked Disabled</CheckboxSwitch>
      </Form.Item>
      <Form.Item label="default">
        <CheckboxSwitch size="default">Checked Disabled</CheckboxSwitch>
      </Form.Item>
    </Form>
  ))
  .add('Radio', () => (
    <Form layout="vertical">
      <Form.Item label="Radio Group">
        <Radio.Group defaultValue={1}>
          <Radio value={1}>Limit</Radio>
          <Radio value={2}>Market</Radio>
          <Radio value={3} disabled>
            Sell
          </Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="Disabled filled">
        <Radio defaultChecked disabled>
          Sell
        </Radio>
      </Form.Item>
    </Form>
  ))
  .add('RadioButton', () => (
    <Form layout="vertical">
      <Form.Item label="Radio Group">
        <Radio.Group defaultValue="w">
          <Radio.Button value="h">Hour</Radio.Button>
          <Radio.Button value="d">Day</Radio.Button>
          <Radio.Button value="w" disabled>
            Week
          </Radio.Button>
          <Radio.Button value="m">Month</Radio.Button>
        </Radio.Group>
      </Form.Item>
    </Form>
  ));
