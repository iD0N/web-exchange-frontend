import React from 'react';
import PropTypes from 'prop-types';
import { Trans, translate } from 'react-i18next';

import {
  Button,
  Form,
  FormScreen,
  FormItem,
  Input,
  Widget,
} from '../../../../../common/components';
import rules from '../../../../../common/rules';

const ChangeEmailForm = ({ form, isLoading, t, onSubmit }) => (
  <Widget title={<Trans i18nKey="changeEmail.title">Change Your Email</Trans>}>
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
          <Button loading={isLoading} disabled={hasErrors} block type="primary" htmlType="submit">
            <Trans i18nKey="changeEmail.save">Save</Trans>
          </Button>
        </Form>
      )}
    </FormScreen>
  </Widget>
);

ChangeEmailForm.propTypes = {
  form: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default translate()(Form.create()(ChangeEmailForm));
