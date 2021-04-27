import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Auth } from 'aws-amplify';
import qs from 'qs';

import { handleAmplifyError } from '../../../../../../common/services/amplify';
import { connectSpinner } from '../../../../../../common/services/spinner';
import { selectUserEmail } from '../../../../../../common/services/user';

import { apiCallIds, enableMfaAction } from '../../../account/ducks';
import SetupMfa from '../components/SetupMfa';

const EnhancedSetupMfa = connectSpinner({
  isLoading: apiCallIds.ENABLE_MFA,
})(SetupMfa);

async function setupMfa() {
  try {
    const user = await Auth.currentAuthenticatedUser();
    return Auth.setupTOTP(user);
  } catch (error) {
    handleAmplifyError(error);
  }
}

const mapStateToProps = state => ({
  email: selectUserEmail(state),
});

const mapDispatchToProps = {
  enableMfa: enableMfaAction,
};

class SetupMfaContainer extends Component {
  static propTypes = {
    email: PropTypes.string.isRequired,
    enableMfa: PropTypes.func.isRequired,
  };

  state = {
    secret: null,
  };

  async componentDidMount() {
    const secret = await setupMfa();
    this.setState({
      secret,
    });
  }

  componentWillMount() {
    this.setState({
      secret: null,
    });
  }

  createQRCodeValue() {
    const { secret } = this.state;
    const { email: username } = this.props;

    const params = {
      secret,
      issuer: 'ACDX',
    };

    return `otpauth://totp/${username}?${qs.stringify(params)}`;
  }

  render() {
    const { enableMfa } = this.props;
    const { secret } = this.state;

    return (
      <EnhancedSetupMfa secret={secret} qrCode={this.createQRCodeValue()} onSubmit={enableMfa} />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SetupMfaContainer);
