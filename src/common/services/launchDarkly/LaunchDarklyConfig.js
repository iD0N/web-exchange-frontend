import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { LaunchDarkly, identify } from 'react-launch-darkly';

import config from '../../../config';
import { selectCognitoSub, selectUserEmail } from '../../services/user';

import { selectSecondary } from './';

const {
  launchDarkly: { clientId },
} = config();

const UNAUTHENTICATED = 'unauthenticated';

const getUserObject = ({ sub, email, secondary }) => ({
  key: sub,
  email,
  secondary,
  anonymous: sub === UNAUTHENTICATED,
});

const mapStateToProps = state => ({
  email: selectUserEmail(state),
  secondary: selectSecondary(state),
  sub: selectCognitoSub(state),
});

class LaunchDarklyConfig extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    email: PropTypes.string.isRequired,
    secondary: PropTypes.string.isRequired,
    sub: PropTypes.string.isRequired,
  };

  static defaultProps = {
    sub: UNAUTHENTICATED,
  };

  componentDidUpdate({ sub: prevSub, email: prevEmail }) {
    const { sub, email } = this.props;

    if (sub !== prevSub || email !== prevEmail) {
      identify(clientId, getUserObject(this.props));
    }
  }

  render() {
    return (
      <LaunchDarkly clientId={clientId} user={getUserObject(this.props)}>
        {this.props.children}
      </LaunchDarkly>
    );
  }
}

export default connect(mapStateToProps)(LaunchDarklyConfig);
