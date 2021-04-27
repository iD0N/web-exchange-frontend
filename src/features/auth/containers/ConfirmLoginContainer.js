import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { connectSpinner } from '../../../common/services/spinner';

import { confirmLoginAction } from '../ducks';
import { apiCallIds } from '../api';
import { selectPreMfaUser } from '../ducks';
import ConfirmLogin from '../components/ConfirmLogin';

const EnhancedConfirmLogin = connectSpinner({
  isLoading: apiCallIds.CONFIRM_LOGIN,
})(ConfirmLogin);

const mapStateToProps = state => ({
  preMfaUser: selectPreMfaUser(state),
});

const mapDispatchToProps = {
  confirmLogin: confirmLoginAction,
};

class ConfirmLoginContainer extends Component {
  static propTypes = {
    confirmLogin: PropTypes.func.isRequired,
  };

  componentWillMount() {
    if (!this.props.preMfaUser) {
      this.props.history.push('/auth/login');
    }
  }

  render() {
    const { confirmLogin } = this.props;

    return <EnhancedConfirmLogin onSubmit={confirmLogin} />;
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ConfirmLoginContainer));
