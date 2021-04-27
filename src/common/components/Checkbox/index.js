import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Checkbox from 'antd/lib/checkbox';
import cn from 'classnames';

class EnhancedCheckbox extends Component {
  render() {
    const { multiline, className, ...props } = this.props;

    return (
      <Checkbox {...props} className={cn({ 'ant-checkbox-multiline': multiline }, className)} />
    );
  }
}

EnhancedCheckbox.propTypes = {
  multiline: PropTypes.bool,
};

export default EnhancedCheckbox;
