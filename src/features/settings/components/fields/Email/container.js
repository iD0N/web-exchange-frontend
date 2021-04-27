import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { connectSpinner } from '../../../../../common/services/spinner';

import { apiCallIds, changeEmailAction } from '../../../../account/fields/ducks';
import ChangeEmail from './component';

const EnhancedChangeEmail = connectSpinner({
  isLoading: apiCallIds.CHANGE_EMAIL,
})(ChangeEmail);

const mapDispatchToProps = {
  changeEmail: changeEmailAction,
};

const ChangeEmailContainer = ({ changeEmail }) => <EnhancedChangeEmail onSubmit={changeEmail} />;

ChangeEmailContainer.propTypes = {
  changeEmail: PropTypes.func.isRequired,
};

export default connect(undefined, mapDispatchToProps)(ChangeEmailContainer);
