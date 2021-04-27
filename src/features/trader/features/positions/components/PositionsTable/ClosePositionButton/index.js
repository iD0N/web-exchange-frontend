import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { selectMarketOrderSizes } from '../../../../orders/ducks';

const mapStateToProps = (state, { position: { hasPosition, contractCode, quantity } }) => {
  const sizesMap = hasPosition ? selectMarketOrderSizes(state) : {};

  return {
    canClose:
      hasPosition && (!sizesMap[contractCode] || !sizesMap[contractCode].plus(quantity).isZero()),
  };
};

class ClosePositionButton extends Component {
  static propTypes = {
    canClose: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    position: PropTypes.object.isRequired,
  };

  handleClick = () => this.props.onClick(this.props.position);

  render() {
    const { canClose, t } = this.props;

    return !!canClose &&
      <div className="close-position-button"
        title={t("trader.tradeMode.closePosition", { defaultValue: "Close Position"})}
        onClick={this.handleClick}>
        Close
      </div>;
  }
}

export default connect(mapStateToProps)(translate()(ClosePositionButton));
