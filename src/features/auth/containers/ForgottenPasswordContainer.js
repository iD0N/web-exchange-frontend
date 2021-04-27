import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { connectSpinner } from '../../../common/services/spinner';
import i18n, { CHINESE } from '../../../common/services/i18n';

import { forgottenPasswordAction } from '../ducks';
import { apiCallIds } from '../api';
import ForgottenPassword from '../components/ForgottenPassword';

const EnhancedForgottenPassword = connectSpinner({
  isLoading: apiCallIds.FORGOTTEN_PASSWORD,
})(ForgottenPassword);

const mapDispatchToProps = {
  forgottenPassword: forgottenPasswordAction,
};

class ForgottenPasswordContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMobileNumber: i18n.language === CHINESE,
    };
  }

  render() {
    return (
      <EnhancedForgottenPassword
        isMobileNumber={this.state.isMobileNumber}
        setIsMobileNumber={value => this.setState({ isMobileNumber: value })}
        onSubmit={this.props.forgottenPassword} />
    );
  }
};

ForgottenPasswordContainer.propTypes = {
  forgottenPassword: PropTypes.func.isRequired,
};

export default connect(undefined, mapDispatchToProps)(ForgottenPasswordContainer);
