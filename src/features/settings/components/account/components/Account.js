import React from 'react';
import PropTypes from 'prop-types';
import { Trans, translate } from 'react-i18next';

import { Col, Row, Spin } from '../../../../../common/components';
import { isTestnet } from '../../../../../config';

import Profile from './Profile';
import MFA from './MFA';
import KYC from './KYC';
import KYCFormModal from './KYCFormModal';

const Account = props => (
  <Row>
    <Col span={props.isMobile ? 24 : 14}>
      <h1>
        <Trans i18nKey="settings.account.header">Account Settings</Trans>
      </h1>
      {isTestnet() ? (
        <div>
          <Trans i18nKey="profile.prodDisclaimer.message">
            Account Settings are managed from crypto mainnet
          </Trans>{' '}
          <a href="https://trade.crypto.io/settings/account">
            <Trans i18nKey="profile.prodDisclaimer.action">
              Click here to manage your settings.
            </Trans>
          </a>
        </div>
      ) : (
        <Spin spinning={props.isLoading || props.isSaving}>
          {!props.isLoading && (
            <>
              <Profile {...props} />
              <h1>
                <Trans i18nKey="profile.security.title">Security</Trans>
              </h1>
              <KYC {...props} />
              <MFA {...props} />
            </>
          )}
        </Spin>
      )}
    </Col>
    <KYCFormModal />
  </Row>
);

Account.propTypes = {
  userAttributes: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isMfaEnabled: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool,
  isSocialUser: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default translate()(Account);
