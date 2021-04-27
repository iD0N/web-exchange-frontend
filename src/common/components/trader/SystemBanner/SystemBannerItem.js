import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FeatureFlag } from 'react-launch-darkly';

import { Alert, Icon } from '../../';

import { typeIcon } from './constants';

const didClose = {};

export default class SystemBannerItem extends Component {
  static propTypes = {
    flagKey: PropTypes.string.isRequired,
    type: PropTypes.oneOf(Object.keys(typeIcon)).isRequired,
  };

  state = {
    visible: true,
  };

  handleClose = () =>
    this.setState({ visible: false }, () => {
      didClose[this.props.flagKey] = true;
    });

  render() {
    const { flagKey, icon, messageOverride, type } = this.props;

    return (
      this.state.visible &&
      !didClose[flagKey] &&
      !!typeIcon[type] && (
        <FeatureFlag
          flagKey={flagKey}
          renderFeatureCallback={message =>
            message && (
              <span className="trader-system-banner">
                <Alert
                  banner
                  closable
                  icon={<Icon type={icon || typeIcon[type]} />}
                  message={<div dangerouslySetInnerHTML={{ __html: messageOverride || message }} />}
                  onClose={this.handleClose}
                  showIcon
                  type={type}
                />
              </span>
            )
          }
        />
      )
    );
  }
}
