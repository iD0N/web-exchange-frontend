import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { ButtonLink, Form, Input, Row, Col } from '../../../../../../common/components';
import { Value } from '../../../../../../common/components/trader';

class MFA extends Component {
  static propTypes = {
    isMfaEnabled: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
  };

  render() {
    const { isMfaEnabled, isSocialUser, t } = this.props;

    return (
      <Form>
        <Row>
          <Col sm={24}>
            <Form.Item
              floating
              label={
                <Trans i18nKey="settings.account.fields.mfa">Multifactor Authentication</Trans>
              }
            >
              {!isSocialUser && (
                <Input
                  value={
                    isMfaEnabled
                      ? t('fields.mfaToggle.enabled', { defaultValue: 'Enabled' })
                      : t('fields.mfaToggle.disabled', { defaultValue: 'Disabled' })
                  }
                  disabled
                  suffix={
                    <ButtonLink link to="/settings/account/mfa">
                      {isMfaEnabled ? (
                        <Trans i18nKey="mfaAction.edit">Edit</Trans>
                      ) : (
                        <Trans i18nKey="mfaAction.setup">Setup</Trans>
                      )}
                    </ButtonLink>
                  }
                />
              )}
            </Form.Item>
            {isSocialUser && (
              <div className="mfa-sso-disclaimer">
                <Value.Text>
                  <Trans i18nKey="settings.mfaToggle.disabled">
                    If you would like to enable MFA for your account, you must configure it through
                    your single sign-on (SSO) provider settings.
                  </Trans>
                </Value.Text>
              </div>
            )}
          </Col>
        </Row>
      </Form>
    );
  }
}

export default MFA;
