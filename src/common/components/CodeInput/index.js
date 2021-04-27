import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Input from 'antd/lib/input';

class CodeInput extends Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
  };

  render() {
    const { t, i18n, tReady, ...props } = this.props;

    return (
      <Input
        autoFocus
        placeholder={t('fields.code.placeholder', { defaultValue: 'Code' })}
        {...props}
        autoComplete="off"
        maxLength={6}
      />
    );
  }
}

export default translate()(CodeInput);
