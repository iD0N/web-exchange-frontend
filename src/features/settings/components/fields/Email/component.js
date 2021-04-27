import React from 'react';
import PropTypes from 'prop-types';
import { Trans, translate } from 'react-i18next';

import { Form, FormScreen, FormItem, Input } from '../../../../../common/components';
import { Button } from '../../../../../common/components/trader';
import rules from '../../../../../common/rules';

const ChangeEmailForm = ({ form, isLoading, t, onSubmit }) => (
  <>
    <h2>
      <Trans i18nKey="changeEmail.title">Change Your Email</Trans>
    </h2>
    <FormScreen form={form} onSubmit={onSubmit}>
      {({ hasErrors, handleSubmit }) => (
        <Form onSubmit={handleSubmit}>
          <FormItem
            id="email"
            rules={[rules.required, ...rules.email]}
            label={<Trans i18nKey="fields.emailAddress.label">E-mail</Trans>}
          >
            <Input
              autoFocus
              placeholder={t('fields.emailAddress.placeholder', {
                defaultValue: 'E-mail',
              })}
              type="email"
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
            <Trans i18nKey="changeEmail.save">Save</Trans>
          </Button>
        </Form>
      )}
    </FormScreen>
  </>
);

ChangeEmailForm.propTypes = {
  form: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default translate()(Form.create()(ChangeEmailForm));
