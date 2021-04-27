import React from 'react';
import PropTypes from 'prop-types';
import { Trans, translate } from 'react-i18next';
import Radio from 'antd/lib/radio';
import 'antd/lib/radio/style/index.css'

import { Button, Form, FormScreen, FormItem, Input, Widget } from '../../../../common/components/';
import rules from '../../../../common/rules';

import MobileNumberInput from '../MobileNumberInput';

const ForgottenPasswordForm = ({ form, t, isLoading, isMobileNumber, onSubmit, setIsMobileNumber }) => (
  <Widget title={<Trans i18nKey="forgottenPassword.title">Forgotten Password</Trans>}>
    <div className="sign-up-page">
      <Radio.Group
        value={isMobileNumber ? "mobile" : "email"}
        onChange={({ target: { value } }) => setIsMobileNumber(value === "mobile")}>
        <Radio.Button value="email">{<Trans i18nKey="fields.email.label">E-mail</Trans>}</Radio.Button>
        <Radio.Button value="mobile">{<Trans i18nKey="fields.mobile.label">Mobile</Trans>}</Radio.Button>
      </Radio.Group>
    </div>
    <FormScreen key={isMobileNumber ? "mobile" : "email"} form={form} onSubmit={onSubmit}>
      {({ hasErrors, handleSubmit }) => (
        <Form onSubmit={handleSubmit}>
          {isMobileNumber
            ? <MobileNumberInput />
            : <FormItem
                id="email"
                rules={[rules.required, ...rules.email]}
                label={<Trans i18nKey="fields.email.label">E-mail</Trans>}
              >
                <Input
                  autoFocus
                  placeholder={t('fields.email.placeholder', { defaultValue: 'E-mail' })}
                  type="email"
                />
              </FormItem>
          }
          <Button loading={isLoading} disabled={hasErrors} block type="primary" htmlType="submit">
            <Trans i18nKey="fields.submit">Submit</Trans>
          </Button>
        </Form>
      )}
    </FormScreen>
  </Widget>
);

ForgottenPasswordForm.propTypes = {
  form: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default translate()(Form.create()(ForgottenPasswordForm));
