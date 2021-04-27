import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import Input from 'antd/lib/input';

import Button from '../Button';

export default class PasswordInput extends Component {
  static propTypes = {
    inputRef: PropTypes.any,
  };

  state = {
    visible: false,
  };

  toggleVisibility = () => {
    this.setState({
      visible: !this.state.visible,
    });
  };

  render() {
    const { inputRef, ...props } = this.props;
    const { visible } = this.state;

    return (
      <Input
        {...props}
        className="password-input"
        type={visible ? 'text' : 'password'}
        suffix={
          <Button link onClick={this.toggleVisibility}>
            {visible ? (
              <Trans i18nKey="passwordInput.hide">Hide</Trans>
            ) : (
              <Trans i18nKey="passwordInput.show">Show</Trans>
            )}
          </Button>
        }
        {...(inputRef ? { ref: inputRef } : {})}
      />
    );
  }
}
