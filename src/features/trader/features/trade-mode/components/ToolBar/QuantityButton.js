import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';

import { Button } from '../../../../../../common/components/trader';

export default class QuantityButton extends Component {
  static propTypes = {
    orderQuantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    quantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    onQuantityChange: PropTypes.func.isRequired,
  };

  state = {
    clicksBeforeMouseLeave: 0,
  };

  resetClickCounter = () => {
    this.setState({ clicksBeforeMouseLeave: 0 });
  };

  updateQuantity = () => {
    const { quantity, onQuantityChange, orderQuantity } = this.props;
    const { clicksBeforeMouseLeave } = this.state;

    const updatedClickCounter = clicksBeforeMouseLeave + 1;
    const newValue =
      updatedClickCounter > 1
        ? BigNumber(quantity)
            .plus(orderQuantity)
            .toNumber()
        : quantity;
    this.setState({ clicksBeforeMouseLeave: updatedClickCounter }, () => {
      onQuantityChange({ value: newValue });
    });
  };

  render() {
    const { label } = this.props;

    return (
      <Button
        animated={false}
        size="small"
        plain
        onClick={this.updateQuantity}
        onMouseLeave={this.resetClickCounter}
      >
        {label}
      </Button>
    );
  }
}
