import React from 'react';
import PropTypes from 'prop-types';
import { Trans, translate } from 'react-i18next';
import Radio from 'antd/lib/radio';
import 'antd/lib/radio/style/index.css'

import i18n, { CHINESE, KOREAN } from '../../../../common/services/i18n';

import {
  AgreementCheckbox,
  Alert,
  Button,
  Form,
  FormScreen,
  FormItem,
  Input,
  Widget,
  // Row,
  // Col,
  // Divider,
  // Container,
  PasswordInput,
  ReferralCodeInput,
} from '../../../../common/components';
import rules from '../../../../common/rules';

import MobileNumberInput from '../MobileNumberInput';

// import SocialButton from '../SocialButton';

const SignUpForm = ({ form, t, hasReferral, isLoading, isMobileNumber, setIsMobileNumber, onSubmit }) => (
  <Widget title={<Trans i18nKey="signUp.title">Sign Up</Trans>}>
    {!!hasReferral && (
      <Alert
        message={t('signUp.referral.title', {
          defaultValue:
            'Looks like you found a referral code! For a limited time only, sign up to receive a 20% discount off fees for your first six months of trading.',
        })}
        type="info"
      />
    )}
    <Radio.Group
      value={isMobileNumber ? "mobile" : "email"}
      onChange={({ target: { value } }) => setIsMobileNumber(value === "mobile")}>
      <Radio.Button value="email">{<Trans i18nKey="fields.email.label">E-mail</Trans>}</Radio.Button>
      { i18n.language === CHINESE || i18n.language === KOREAN ? <Radio.Button value="mobile">{<Trans i18nKey="fields.mobile.label">Mobile</Trans>}</Radio.Button> : <></>}
    </Radio.Group>
    <FormScreen key={isMobileNumber ? "mobile" : "email"} form={form} onSubmit={onSubmit}>
      {({ hasErrors, handleSubmit }) => (
        <Form onSubmit={handleSubmit}>
          {isMobileNumber
            ? <MobileNumberInput />
            : <FormItem
                id="email"
                rules={[rules.required, ...rules.email]}
                label={<Trans i18nKey="signUp.email.label">E-mail</Trans>}
              >
                <Input
                  placeholder={t('signUp.email.placeholder', { defaultValue: 'E-mail' })}
                  type="email"
                  autoFocus
                />
              </FormItem>
          }
          <FormItem
            id="password"
            rules={rules.passwordWithLimit}
            label={<Trans i18nKey="fields.password.label">Password</Trans>}
          >
            <PasswordInput
              placeholder={t('signUp.password.placeholder', {
                defaultValue: 'Choose Password',
              })}
            />
          </FormItem>          
          <Trans i18nKey="signUp.password.passwordRequirements">Passwords must be at least 8 characters long, and require at least one number, upper and lowercase letter, and special character.</Trans>
          <div><br /></div>          
          <FormItem id="agreement" valuePropName="checked" rules={[rules.checked]}>
            <AgreementCheckbox />
          </FormItem>
          <ReferralCodeInput />
          <Button loading={isLoading} disabled={hasErrors} block type="primary" htmlType="submit">
            <Trans i18nKey="signUp.signUp">Sign Up</Trans>
          </Button>
        </Form>
      )}
    </FormScreen>
  </Widget>
);

SignUpForm.propTypes = {
  form: PropTypes.object.isRequired,
  hasReferral: PropTypes.bool,
  t: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default translate()(Form.create()(SignUpForm));
