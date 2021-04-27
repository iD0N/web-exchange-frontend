import React, { Component } from 'react';
import Input from 'antd/lib/input';

class TraderInput extends Component {
  render() {
    return <Input prefixCls="trader-input" {...this.props} />;
  }
}

export default TraderInput;
