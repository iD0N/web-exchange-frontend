import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { ButtonLink } from '../../../../../common/components/trader';
import { Empty } from '../../../../../common/components/trader';

const LoggedOutPlaceholder = ({ description, title }) => (
  <Empty
    className="logged-out-placeholder"
    description={<Trans i18nKey="widget.unauthed">You must be logged in to use this widget.</Trans>}
  >
    <ButtonLink to="/auth/sign-up">
      <Trans i18nKey="nav.signup">Sign Up</Trans>
    </ButtonLink>
    <ButtonLink type="ghost" to="/auth/login?redirect=/trader">
      <Trans i18nKey="nav.login">Log In</Trans>
    </ButtonLink>
  </Empty>
);

LoggedOutPlaceholder.propTypes = {
  description: PropTypes.bool,
};

export default memo(LoggedOutPlaceholder);
