import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { connectSpinner } from '../../../../../common/services/spinner';

import { apiCallIds, changePasswordAction } from '../../account/ducks';
import ChangePassword from './component';

const EnhancedChangePassword = connectSpinner({
  isLoading: apiCallIds.CHANGE_PASSWORD,
})(ChangePassword);

const mapDispatchToProps = {
  changePassword: changePasswordAction,
};

const ChangePasswordContainer = ({ changePassword }) => (
  <EnhancedChangePassword onSubmit={changePassword} />
);

ChangePasswordContainer.propTypes = {
  changePassword: PropTypes.func.isRequired,
};

export default connect(undefined, mapDispatchToProps)(ChangePasswordContainer);
