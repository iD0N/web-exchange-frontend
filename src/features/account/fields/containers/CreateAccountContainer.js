import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { connectSpinner } from '../../../../common/services/spinner';
import { selectUserAttributes } from '../../../../common/services/user';

import {
  apiCallIds,
  selectIsMissingEmail,
  selectIsMissingAgreements,
  createAccountAction,
} from '../ducks';
import CreateAccount from '../components/CreateAccount';

const EnhancedCreateAccount = connectSpinner({
  isLoading: apiCallIds.CREATE_ACCOUNT,
})(CreateAccount);

const mapStateToProps = state => ({
  userAttributes: selectUserAttributes(state),
  isMissingEmail: selectIsMissingEmail(state),
  isMissingAgreements: selectIsMissingAgreements(state),
});

const mapDispatchToProps = {
  createAccount: createAccountAction,
};

const CreateAccountContainer = ({
  userAttributes,
  isMissingEmail,
  isMissingAgreements,
  createAccount,
}) => (
  <EnhancedCreateAccount
    userAttributes={userAttributes}
    isMissingEmail={isMissingEmail}
    isMissingAgreements={isMissingAgreements}
    onSubmit={createAccount}
  />
);

CreateAccountContainer.propTypes = {
  userAttributes: PropTypes.object.isRequired,
  isMissingEmail: PropTypes.bool.isRequired,
  isMissingAgreements: PropTypes.bool.isRequired,
  createAccount: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateAccountContainer);
