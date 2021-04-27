import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import rules from '../../rules';

import { Widget, Form, FormScreen, FormItem, Input, Button } from '../';

const FormExample = Form.create()(({ form }) => (
  <FormScreen form={form} onSubmit={action('form-submit')}>
    {({ hasErrors, handleSubmit }) => (
      <Form onSubmit={handleSubmit}>
        <FormItem id="name" rules={[rules.required]} label="First name">
          <Input placeholder="First name" autoFocus />
        </FormItem>
        <Button block htmlType="submit" type="primary" disabled={hasErrors}>
          Save
        </Button>
      </Form>
    )}
  </FormScreen>
));

storiesOf('Form', module).add('default', () => (
  <Widget title="Form Example">
    <FormExample />
  </Widget>
));
