import React from 'react';
import PropTypes from 'prop-types';
import { Trans, translate } from 'react-i18next';

import {
  AgreementCheckbox,
  Button,
  Form,
  FormScreen,
  FormItem,
  Input,
  ReferralCodeInput,
  Widget,
} from '../../../../../common/components';
import rules from '../../../../../common/rules';

const CreateAccountForm = ({
  form,
  userAttributes,
  isMissingEmail,
  isMissingAgreements,
  isLoading,
  t,
  onSubmit,
}) => (
  <Widget title={<Trans i18nKey="createAccount.title">Create Your Account</Trans>}>
    <FormScreen form={form} onSubmit={onSubmit}>
      {({ hasErrors, handleSubmit }) => (
        <Form onSubmit={handleSubmit}>
          <Form.Item
            id="given_name"
            floating
            label={<Trans i18nKey="fields.givenName.label">Given name</Trans>}
          >
            <Input id="given_name" disabled value={userAttributes.given_name} />
          </Form.Item>
          <Form.Item
            id="family_name"
            floating
            label={<Trans i18nKey="fields.familyName.label">Family name</Trans>}
          >
            <Input id="family_name" disabled value={userAttributes.family_name} />
          </Form.Item>
          {isMissingEmail ? (
            <FormItem
              id="email"
              rules={[rules.required, ...rules.email]}
              initialValue={userAttributes.email}
              label={<Trans i18nKey="fields.emailAddress.label">E-mail</Trans>}
            >
              <Input
                autoFocus
                placeholder={t('fields.emailAddress.placeholder', {
                  defaultValue: 'E-mail',
                })}
              />
            </FormItem>
          ) : (
            <Form.Item
              id="email"
              floating
              label={<Trans i18nKey="fields.emailAddress.label">E-mail</Trans>}
            >
              <Input id="email" disabled value={userAttributes.email} type="email" />
            </Form.Item>
          )}
          {isMissingAgreements && (
            <FormItem id="agreements" valuePropName="checked" rules={[rules.checked]}>
              <AgreementCheckbox autoFocus={!isMissingEmail} />
            </FormItem>
          )}
          <ReferralCodeInput />
          <Button loading={isLoading} disabled={hasErrors} block type="primary" htmlType="submit">
            <Trans i18nKey="createAccount.signUp">Continue</Trans>
          </Button>
        </Form>
      )}
    </FormScreen>
  </Widget>
);

CreateAccountForm.propTypes = {
  form: PropTypes.object.isRequired,
  userAttributes: PropTypes.object.isRequired,
  isMissingEmail: PropTypes.bool.isRequired,
  isMissingAgreements: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default translate()(Form.create()(CreateAccountForm));
