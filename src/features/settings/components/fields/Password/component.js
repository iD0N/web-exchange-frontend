import React from 'react';
import PropTypes from 'prop-types';
import { Trans, translate } from 'react-i18next';

import { Form, FormScreen, FormItem, PasswordInput, Spin } from '../../../../../common/components';
import { Button } from '../../../../../common/components/trader';
import rules from '../../../../../common/rules';

const ChangePassword = ({ form, isLoading, t, onSubmit }) => (
  <>
    <h2>Change Password</h2>
    <Spin spinning={isLoading}>
      <FormScreen form={form} onSubmit={onSubmit}>
        {({ hasErrors, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <FormItem
              id="password"
              float
              rules={[rules.password, rules.required]}
              label={<Trans i18nKey="changePassword.currentPassword.label">Current Password</Trans>}
            >
              <PasswordInput
                autoFocus
                placeholder={t('changePassword.currentPassword.placeholder', {
                  defaultValue: 'Current Password',
                })}
              />
            </FormItem>
            <FormItem
              id="newPassword"
              float
              rules={rules.passwordWithLimit}
              label={<Trans i18nKey="changePassword.newPassword.label">New Password</Trans>}
            >
              <PasswordInput
                placeholder={t('changePassword.newPassword.placeholder', {
                  defaultValue: 'New Password',
                })}
              />
            </FormItem>
            <FormItem
              id="confirmNewPassword"
              float
              rules={rules.passwordWithLimit}
              label={
                <Trans i18nKey="changePassword.confirmNewPassword.label">
                  Confirm New Password
                </Trans>
              }
            >
              <PasswordInput
                placeholder={t('changePassword.confirmNewPassword.label', {
                  defaultValue: 'Confirm New Password',
                })}
              />
            </FormItem>
            <Button
              size="medium"
              loading={isLoading}
              disabled={hasErrors}
              block
              type="ghost"
              htmlType="submit"
            >
              <Trans i18nKey="changePassword.changePassword">Change Password</Trans>
            </Button>
          </Form>
        )}
      </FormScreen>
    </Spin>
  </>
);

ChangePassword.propTypes = {
  form: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default translate()(Form.create()(ChangePassword));
