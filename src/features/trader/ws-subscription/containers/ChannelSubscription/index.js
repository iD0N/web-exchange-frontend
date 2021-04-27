import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { subscribeAction, unsubscribeAction } from '../../ducks';

const mapDispatchToProps = {
  subscribe: subscribeAction,
  unsubscribe: unsubscribeAction,
};

class ChannelSubscription extends Component {
  static propTypes = {
    channel: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    subscribe: PropTypes.func.isRequired,
    unsubscribe: PropTypes.func.isRequired,
    forceResubscribe: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    forceResubscribe: false,
  };

  componentDidMount() {
    const { subscribe, channel, forceResubscribe } = this.props;
    subscribe({ channel, forceResubscribe });
  }

  componentWillUnmount() {
    const { unsubscribe, channel } = this.props;
    unsubscribe({ channel });
  }

  render() {
    return this.props.children;
  }
}

export default connect(undefined, mapDispatchToProps)(ChannelSubscription);
