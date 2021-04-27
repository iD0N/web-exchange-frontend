import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { show } from 'redux-modal';

import { EVENT_ACTIONS } from '../../../../../../common/services/eventLogger/constants';
import { ORDER_SIDE } from '../../../../../../common/enums';
import { Button, Dropdown, Menu } from '../../../../../../common/components/trader';

import { CLOSE_POSITION_MODAL_ID } from './';

const { Item: MenuItem } = Menu;

const MENU_KEY = {
  CANCEL_ALL_ORDERS: 'cancelAllOrders',
  CANCEL_BUY_ORDERS: 'cancelBuyOrders',
  CANCEL_SELL_ORDERS: 'cancelSellOrders',
  CLOSE_POSITION: 'closePosition',
};

const mapDispatchToProps = {
  showClosePositionModal: () => show(CLOSE_POSITION_MODAL_ID),
};

class ManageOrders extends Component {
  static propTypes = {
    cancelOrdersBySide: PropTypes.func.isRequired,
    contractCode: PropTypes.string.isRequired,
    classPrefix: PropTypes.string.isRequired,
  };

  handleMenuItemClick = ({ key }) => {
    const { cancelOrdersBySide, contractCode, logEvent, showClosePositionModal } = this.props;

    switch (key) {
      case MENU_KEY.CANCEL_ALL_ORDERS:
        logEvent(EVENT_ACTIONS.CANCEL_ALL_ORDERS);
        return cancelOrdersBySide({ contractCode });
      case MENU_KEY.CANCEL_BUY_ORDERS:
        logEvent(EVENT_ACTIONS.CANCEL_ALL_ORDERS_BUY);
        return cancelOrdersBySide({ side: ORDER_SIDE.BUY, contractCode });
      case MENU_KEY.CANCEL_SELL_ORDERS:
        logEvent(EVENT_ACTIONS.CANCEL_ALL_ORDERS_SELL);
        return cancelOrdersBySide({ side: ORDER_SIDE.SELL, contractCode });
      case MENU_KEY.CLOSE_POSITION:
        logEvent(EVENT_ACTIONS.CLOSE_POSITION_INITIATE);
        return showClosePositionModal();
      default:
    }
  };

  render() {
    const { classPrefix } = this.props;

    return (
      <Button ghost upper>
        <Dropdown
          placement="bottomRight"
          overlay={
            <Menu onClick={this.handleMenuItemClick}>
              <MenuItem
                key={MENU_KEY.CANCEL_ALL_ORDERS}
                className={`${classPrefix}-cancel-all-orders`}
              >
                <Trans i18nKey="trader.tradeMode.cancelAllOrders">Cancel All Orders</Trans>
              </MenuItem>
              <MenuItem
                key={MENU_KEY.CANCEL_BUY_ORDERS}
                className={`${classPrefix}-cancel-all-buy-orders`}
              >
                <Trans i18nKey="trader.tradeMode.cancelAllBuys">Cancel All Buy Orders</Trans>
              </MenuItem>
              <MenuItem
                key={MENU_KEY.CANCEL_SELL_ORDERS}
                className={`${classPrefix}-cancel-all-sell-orders`}
              >
                <Trans i18nKey="trader.tradeMode.cancelAllSells">Cancel All Sell Orders</Trans>
              </MenuItem>
              <MenuItem key={MENU_KEY.CLOSE_POSITION} className={`${classPrefix}-cancel-position`}>
                <Trans i18nKey="trader.tradeMode.closePosition">Close Position</Trans>
              </MenuItem>
            </Menu>
          }
        >
          <Trans i18nKey="trader.tradeMode.manage">Manage</Trans>
        </Dropdown>
      </Button>
    );
  }
}

export default connect(undefined, mapDispatchToProps)(ManageOrders);
