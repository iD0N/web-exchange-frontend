import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';

import { logEventAction } from '../../../../../../common/services/eventLogger';
import {
  EVENT_ACTIONS,
  EVENT_TYPES,
} from '../../../../../../common/services/eventLogger/constants';
import { ORDER_SIDE, ORDER_TYPE } from '../../../../../../common/enums';
import { Button } from '../../../../../../common/components/trader';
import {
  AUTO_LIQUIDATION,
  AUTO_REJECT,
  SIZE_TYPE,
} from '../../../../features/order-entry/constants';
// import { selectContractByCode, selectTickerData } from '../../../../data-store/ducks';
// import { selectTokenFreeBalance } from '../../../../features/positions/components/BalancesTable/ducks';
// import getMaxBuySellForSpot from '../../getMaxBuySellForSpot';

const mapStateToProps = (state, { liqEstimates: { afterBuy, afterSell } }) => ({
  disableBuy: afterBuy === AUTO_LIQUIDATION || afterBuy === AUTO_REJECT,
  disableSell: afterSell === AUTO_LIQUIDATION || afterSell === AUTO_REJECT,
});

const mapDispatchToProps = {
  logEvent: logEventAction,
};

class Buttons extends Component {
  static propTypes = {
    hasErrors: PropTypes.bool.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    isMobile: PropTypes.bool,
    orderType: PropTypes.string.isRequired,
    sizeType: PropTypes.string.isRequired,
    canBuy: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    canSell: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    liqEstimates: PropTypes.object.isRequired,
  };

  logClickEvent = ({ side, ...data } = {}) => {
    const {
      contractCode,
      isModify,
      isMobile,
      logEvent,
      orderId,
      orderType,
      price,
      size,
      sizeType,
      stopPrice,
    } = this.props;
    logEvent({
      ...data,
      action: isModify ? EVENT_ACTIONS.MODIFY_ORDER_CONFIRM : EVENT_ACTIONS.CREATE_ORDER_INITIATE,
      isMobile: !!isMobile,
      orderInfo: {
        contractCode,
        orderId,
        type: orderType,
        price,
        side,
        size,
        sizeType,
        stopPrice,
      },
      type: EVENT_TYPES.CLICK,
      widget: isModify ? 'open-orders-table' : 'order-entry',
    });
  };

  render() {
    const {
      disableBuy,
      disableSell,
      hasErrors,
      handleSubmit,
      isModify,
      isMobile,
      modifyOrderSide,
      canBuy,
      canSell,
      orderType,
      sizeType,
      underlying,
    } = this.props;

    return isModify ? (
      <Button
        block
        disabled={
          hasErrors ||
          (modifyOrderSide === ORDER_SIDE.BUY && disableBuy) ||
          (modifyOrderSide === ORDER_SIDE.SELL && disableSell)
        }
        id="order-modify-submit-btn"
        upper
        ghost
        onClick={handleSubmit}
        onClickCapture={e =>
          this.logClickEvent({ side: modifyOrderSide, elementId: 'order-modify-submit-btn' })
        }
      >
        <Trans i18nKey="trader.orders.modify">Modify</Trans>
      </Button>
    ) : (
      <>
        <Button.SpaceGroup>
          <Button
            block
            id="order-entry-buy-btn"
            disabled={hasErrors || canBuy == null || disableBuy}
            type="positive"
            size={isMobile ? 'large' : 'default'}
            upper
            onClickCapture={e =>
              this.logClickEvent({ side: 'buy', elementId: 'order-entry-buy-btn' })
            }
            onClick={e =>
              handleSubmit(e, {
                side: ORDER_SIDE.BUY,
                extras:
                  orderType === ORDER_TYPE.MARKET && sizeType === SIZE_TYPE.NOTIONAL
                    ? { size: canBuy }
                    : {},
              })
            }
          >
            <>
              <Trans i18nKey="trader.orderEntry.buy">buy</Trans>
              {underlying ? (
                <div className="order-entry-button-underlying"> {underlying}</div>
              ) : null}
            </>
          </Button>
          <Button
            block
            id="order-entry-sell-btn"
            disabled={hasErrors || canSell == null || disableSell}
            type="negative"
            size={isMobile ? 'large' : 'default'}
            upper
            onClickCapture={e =>
              this.logClickEvent({ side: 'sell', elementId: 'order-entry-sell-btn' })
            }
            onClick={e =>
              handleSubmit(e, {
                side: ORDER_SIDE.SELL,
                extras:
                  orderType === ORDER_TYPE.MARKET && sizeType === SIZE_TYPE.NOTIONAL
                    ? { size: canSell }
                    : {},
              })
            }
          >
            <>
              <Trans i18nKey="trader.orderEntry.sell">sell</Trans>
              {underlying ? (
                <div className="order-entry-button-underlying"> {underlying}</div>
              ) : null}
            </>
          </Button>
        </Button.SpaceGroup>
      </>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Buttons);
