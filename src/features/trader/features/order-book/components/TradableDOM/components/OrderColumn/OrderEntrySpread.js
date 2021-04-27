import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { ORDER_SIDE, ORDER_TYPE } from '../../../../../../../../common/enums';
import { ORDER_TYPE_ABBREVIATIONS } from '../../../../../../constants';

export default class OrderEntrySpread extends PureComponent {
  static propTypes = {
    levelPrice: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
    orderType: PropTypes.string.isRequired,
  };

  handleBuy = () =>
    this.props.onSubmit({
      ...(this.props.orderType === ORDER_TYPE.LIMIT
        ? { price: this.props.levelPrice, reduceOnly: false }
        : { stopPrice: this.props.levelPrice, reduceOnly: true }),
      side: ORDER_SIDE.BUY,
      type: this.props.orderType,
    });

  handleSell = () =>
    this.props.onSubmit({
      ...(this.props.orderType === ORDER_TYPE.LIMIT
        ? { price: this.props.levelPrice, reduceOnly: false }
        : { stopPrice: this.props.levelPrice, reduceOnly: true }),
      side: ORDER_SIDE.SELL,
      type: this.props.orderType,
    });

  render() {
    const { orderType } = this.props;

    return (
      <>
        <div className="spread-cell spread-cell-buy" onClick={this.handleBuy}>
          {ORDER_TYPE_ABBREVIATIONS[orderType]} <Trans i18nKey="trader.orderEntry.buy">Buy</Trans>
        </div>
        <div className="spread-cell spread-cell-sell" onClick={this.handleSell}>
          {ORDER_TYPE_ABBREVIATIONS[orderType]} <Trans i18nKey="trader.orderEntry.sell">Sell</Trans>
        </div>
      </>
    );
  }
}
