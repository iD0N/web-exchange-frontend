import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import QRCode from 'qrcode.react';

import { Form, FormScreen, FormItem, CodeInput, Spin } from '../../../../../../common/components';
import { Button } from '../../../../../../common/components/trader';
import rules from '../../../../../../common/rules';

const SetupMfa = ({ form, qrCode, isLoading, secret, t, onSubmit }) => (
  <div className="setup-mfa-wrapper">
    <h2>
      <Trans i18nKey="mfaSetup.title">Setup Multi-factor Auth</Trans>
    </h2>
    <Spin spinning={isLoading || !secret}>
      {!!secret && (
        <>
          <div className="mfa-qr-code-wrapper">
            <QRCode size={200} value={qrCode} data-qrcode={qrCode} />
          </div>
          <p>
            <Trans i18nKey="mfaSetup.instructions">
              Scan the code with a one-time password (OTP) app like Google Authenticator. Then enter
              the generated password below:
            </Trans>
          </p>
          <FormScreen form={form} onSubmit={onSubmit}>
            {({ hasErrors, handleSubmit }) => (
              <Form onSubmit={handleSubmit}>
                <FormItem
                  id="code"
                  rules={[rules.required, rules.code]}
                  label={<Trans i18nKey="mfaSetup.code.label">Code</Trans>}
                >
                  <CodeInput autoFocus />
                </FormItem>
                <Button
                  block
                  size="medium"
                  type="ghost"
                  htmlType="submit"
                  loading={isLoading}
                  disabled={hasErrors}
                >
                  <Trans i18nKey="mfaSetup.submit">Enable MFA</Trans>
                </Button>
              </Form>
            )}
          </FormScreen>
        </>
      )}
    </Spin>
  </div>
);

SetupMfa.propTypes = {
  form: PropTypes.object.isRequired,
  qrCode: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default Form.create()(SetupMfa);
