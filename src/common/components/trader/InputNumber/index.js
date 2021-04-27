import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InputNumber from 'antd/lib/input-number';
import cn from 'classnames';

class TraderInputNumber extends Component {
  static propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    masked: PropTypes.bool,
  };

  shouldComponentUpdate(nextProps, nextState) {
    // TODO(rogs): why is this necessary? Shouldn't the built-in shallow comparison decide
    // that nothing has change? (Tried deriving from PureComponent instead of Component, and that
    // didn't work.)
    //
    // (Spot-checked with a deep-equal comparison for the SizeInput use case, and it found that the
    // nextProps and this.props were not the same only because the rules list had changed, but I
    // believe that's just because it can't tell that two idential functions are the same.)
    return nextState !== this.state || nextProps.value !== this.props.value;
  }

  render() {
    const { masked, className, disabled, ...bag } = this.props;

    return (
      <InputNumber
        prefixCls="trader-input-number"
        className={cn(className, { masked })}
        disabled={disabled || masked}
        {...bag}
      />
    );
  }
}

export default TraderInputNumber;
