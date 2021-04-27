import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Select from 'antd/lib/select';
import Icon from 'antd/lib/icon';
import cn from 'classnames';

export default class TraderSelect extends Component {
  static propTypes = {
    className: PropTypes.string,
    borderless: PropTypes.bool,
  };

  render() {
    const { borderless, className, ...bag } = this.props;

    return (
      <Select
        prefixCls="trader-select"
        className={cn(className, { 'trader-select-borderless': borderless })}
        clearIcon={<Icon type="close" />}
        {...bag}
      />
    );
  }
}

TraderSelect.Option = Select.Option;
