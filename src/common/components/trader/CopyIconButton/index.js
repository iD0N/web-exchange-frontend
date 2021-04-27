import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import { Icon } from '../../';
import copy from 'copy-to-clipboard';
import cn from 'classnames';

import Tooltip from '../Tooltip';

class CopyIconButton extends Component {
  static propTypes = {
    content: PropTypes.string.isRequired,
    className: PropTypes.string,
    forInput: PropTypes.bool,
  };

  state = {
    clicked: false,
  };

  handleClick = () => {
    const { content } = this.props;
    this.setState({ clicked: true }, () => copy(content));
  };

  handleVisibleChange = visible => {
    if (!visible) {
      setTimeout(() => this.setState({ clicked: false }), 100);
    }
  };

  render() {
    const { className, forInput } = this.props;

    return (
      <span className={cn({ 'trader-copy-icon-wrapper': forInput })}>
        <span className={cn('trader-copy-icon-button', { [className]: true })}>
          <Tooltip
            title={
              this.state.clicked ? (
                <Trans i18nKey="trader.control.copySuccess">Copied!</Trans>
              ) : (
                <Trans i18nKey="trader.control.copy">Click to copy</Trans>
              )
            }
            onVisibleChange={this.handleVisibleChange}
          >
            <CopyIcon onClick={this.handleClick} />
          </Tooltip>
        </span>
      </span>
    );
  }
}

export default CopyIconButton;

const CopyIcon = ({ onClick }) => (
  <Icon
    type="copy"
    onClick={e => {
      e.stopPropagation();
      onClick();
    }}
  />
);

CopyIcon.propTypes = {
  onClick: PropTypes.func.isRequired,
};
