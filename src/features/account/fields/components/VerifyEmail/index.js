import React from 'react';
import { Trans } from 'react-i18next';

import { ButtonLink } from '../../../../../common/components';
import VerifyEmail from '../../../../auth/components/VerifyEmail';

const EnhancedVerifyEmail = props => (
  <VerifyEmail
    emailCredentialExists
    changeEmailButton={
      <ButtonLink block link to="/fields/change-email">
        <Trans i18nKey="verifyEmail.changeEmail">Change email</Trans>
      </ButtonLink>
    }
    {...props}
  />
);

export default EnhancedVerifyEmail;
