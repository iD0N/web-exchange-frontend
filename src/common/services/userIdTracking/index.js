import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { selectCognitoSub, selectUserEmail } from '../../services/user';

const mapStateToProps = state => ({
  sub: selectCognitoSub(state),
  email: selectUserEmail(state),
});

class UserIdTrackingConfig extends Component {
  static propTypes = {
    sub: PropTypes.string,
    email: PropTypes.string,
  };

  static defaultProps = {
    sub: null,
  };

  componentDidUpdate({ sub: prevSub }) {
    const { sub } = this.props;
    if (sub !== prevSub) {
      this.identify();
    }
  }

  identify() {
    const { email, sub } = this.props;
    const { FS } = window;

    // HubSpot
    if (email) {
      const _hsq = (window._hsq = window._hsq || []);
      _hsq.push(['identify', { email }]);
    }

    if (FS && sub && FS) {
      FS.identify(sub, { email });
    }
  }

  render() {
    return null;
  }
}

export default connect(mapStateToProps)(UserIdTrackingConfig);
