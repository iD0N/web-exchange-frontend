import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { openSocketActions, forceCloseSocketAction } from './';
import config from '../../../config';

const mapDispatchToProps = {
  forceCloseSocket: forceCloseSocketAction,
  openSocket: openSocketActions.request,
};

class WebsocketConnection extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    forceCloseSocket: PropTypes.func.isRequired,
    openSocket: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.props.openSocket({
      uri: config().wsURL,
    });
  }

  componentWillUnmount() {
    this.props.forceCloseSocket();
  }

  render() {
    return <span>{this.props.children}</span>;
  }
}

export default connect(undefined, mapDispatchToProps)(WebsocketConnection);
