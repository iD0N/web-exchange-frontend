import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import {
  Button,
  Form,
  FormScreen,
  FormItem,
  CodeInput,
  Widget,
} from '../../../../common/components';
import rules from '../../../../common/rules';

const ConfirmLogin = ({ form, isLoading, onSubmit }) => (
  <Widget centered title={<Trans i18nKey="confirmLogin.title">Confirm Login</Trans>}>
    <div className="content">
      <p>
        <Trans i18nKey="confirmLogin.message">Please enter code from your MFA device.</Trans>
      </p>
    </div>
    <FormScreen form={form} onSubmit={onSubmit}>
      {({ hasErrors, handleSubmit }) => (
        <Form onSubmit={handleSubmit}>
          <FormItem
            id="code"
            rules={[rules.required, rules.code]}
            className="code-input"
            label={<Trans i18nKey="fields.code.label">Code</Trans>}
          >
            <CodeInput size="large" autoFocus />
          </FormItem>
          <Button block type="primary" htmlType="submit" loading={isLoading} disabled={hasErrors}>
            <Trans i18nKey="confirmLogin.continue">Continue</Trans>
          </Button>
        </Form>
      )}
    </FormScreen>
  </Widget>
);

ConfirmLogin.propTypes = {
  form: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default Form.create()(ConfirmLogin);
