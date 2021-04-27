import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { connectSpinner } from '../../../common/services/spinner';

import {
  verifyEmailAction,
  resendEmailVerificationAction,
  selectEmailCredentialExists,
  selectMobileCredentialExists,
} from '../ducks';
import { apiCallIds } from '../api';
import VerifyEmail from '../components/VerifyEmail';

const EnhancedVerifyEmail = connectSpinner({
  isLoading: apiCallIds.VERIFY_EMAIL,
  isLoggingIn: apiCallIds.LOGIN,
  isResendEmailVerificationLoading: apiCallIds.RESEND_EMAIL_VERIFICATION,
})(VerifyEmail);

const mapStateToProps = state => ({
  emailCredentialExists: selectEmailCredentialExists(state),
  mobileCredentialExists: selectMobileCredentialExists(state),
});

const mapDispatchToProps = {
  verifyEmail: verifyEmailAction,
  resendEmailVerification: resendEmailVerificationAction,
};

const VerifyEmailContainer = ({ resendEmailVerification, verifyEmail, isVerifyMobile, emailCredentialExists, mobileCredentialExists }) => (
  <EnhancedVerifyEmail
    emailCredentialExists={emailCredentialExists}
    mobileCredentialExists={mobileCredentialExists}
    onSubmit={verifyEmail}
    isVerifyMobile={isVerifyMobile}
    onResendEmailVerification={resendEmailVerification}
  />
);

VerifyEmailContainer.propTypes = {
  emailCredentialExists: PropTypes.bool.isRequired,
  resendEmailVerification: PropTypes.func.isRequired,
  verifyEmail: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(VerifyEmailContainer);
