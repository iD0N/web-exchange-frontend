import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { Button } from '../../../../../../common/components/trader';

const DisableMfa = ({ isLoading, onSubmit }) => (
  <div className="disable-mfa-wrapper">
    <h2>
      <Trans i18nKey="disableMfa.title">Disable Multi-factor Auth</Trans>
    </h2>
    <p>
      <Trans i18nKey="disableMfa.note">Disabling MFA makes your account less secure.</Trans>
    </p>
    <Button
      block
      type="ghost"
      size="medium"
      loading={isLoading}
      disabled={isLoading}
      onClick={onSubmit}
    >
      <Trans i18nKey="disableMfa.submit">Disable MFA</Trans>
    </Button>
  </div>
);

DisableMfa.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default DisableMfa;
