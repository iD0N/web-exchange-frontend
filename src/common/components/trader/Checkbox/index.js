import React, { Component } from 'react';
import Checkbox from 'antd/lib/checkbox';

class TraderCheckbox extends Component {
  render() {
    return <Checkbox prefixCls="trader-checkbox" {...this.props} />;
  }
}

TraderCheckbox.Group = Checkbox.Group;

export default TraderCheckbox;
