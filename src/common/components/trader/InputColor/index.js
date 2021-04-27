import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ColorPicker from 'rc-color-picker';

export default class InputColor extends Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func,
  };

  handleChange = ({ color }) => {
    if (this.props.onChange) {
      this.props.onChange(color);
    }
  };

  render() {
    const { value } = this.props;

    return <ColorPicker enableAlpha={false} color={value} onChange={this.handleChange} />;
  }
}
