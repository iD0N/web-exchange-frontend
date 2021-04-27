import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { connectSpinner } from '../../../../common/services/spinner';

import VerifyEmail from '../components/VerifyEmail';
import { apiCallIds, verifyUserEmailInitAction, verifyUserEmailSubmitAction } from '../ducks';

const EnhancedVerifyEmail = connectSpinner({
  isLoading: apiCallIds.VERIFY_USER_EMAIL_SUBMIT,
  isResendEmailVerificationLoading: apiCallIds.VERIFY_USER_EMAIL_INIT,
})(VerifyEmail);

const mapDispatchToProps = {
  initVerifyEmail: verifyUserEmailInitAction,
  submitVerifyEmail: verifyUserEmailSubmitAction,
};

const VerifyEmailAttributeContainer = ({ initVerifyEmail, submitVerifyEmail }) => (
  <EnhancedVerifyEmail onSubmit={submitVerifyEmail} onResendEmailVerification={initVerifyEmail} />
);

VerifyEmailAttributeContainer.propTypes = {
  initVerifyEmail: PropTypes.func.isRequired,
  submitVerifyEmail: PropTypes.func.isRequired,
};

export default connect(undefined, mapDispatchToProps)(VerifyEmailAttributeContainer);
