import React, { Component } from 'react';
import Radio from 'antd/lib/radio';

class TraderRadio extends Component {
  render() {
    return <Radio prefixCls="trader-radio" {...this.props} />;
  }
}

const TraderRadioButton = props => <Radio.Button prefixCls="trader-radio-button" {...props} />;

class TraderRadioGroup extends Component {
  render() {
    return <Radio.Group prefixCls="trader-radio" {...this.props} />;
  }
}

TraderRadio.Group = TraderRadioGroup;
TraderRadio.Button = TraderRadioButton;

export default TraderRadio;
