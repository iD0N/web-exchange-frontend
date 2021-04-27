import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { connectModal } from 'redux-modal';
import { Trans } from 'react-i18next';
import cn from 'classnames';
import BigNumber from 'bignumber.js';

import {
  EVENT_ACTIONS,
  EVENT_TYPES,
} from '../../../../../../common/services/eventLogger/constants';
import { logEventAction } from '../../../../../../common/services/eventLogger';
import { CONTRACT_TYPE, ORDER_SIDE, ORDER_TYPE } from '../../../../../../common/enums';
import { ConfirmationModal } from '../../../../../../common/components/trader';
import OpenOrderSummary from '../../../orders/components/OpenOrderSummary';
import { selectPosition } from '../../../positions/ducks';
import {
  selectContractByCode,
  selectMarkPrice,
  selectDollarizer,
} from '../../../../data-store/ducks';

import ConfirmOrderToggle, { TOGGLE_TYPE } from './components/ConfirmOrderToggle';
import {
  selectLiquidationPriceGivenPosition,
  selectEffectiveLeverageGivenPosition,
} from '../../ducks';
import { CONFIRM_ORDER_MODAL_ID } from '../../constants';

const ConfirmModal = ConfirmationModal(CONFIRM_ORDER_MODAL_ID);

const mapStateToProps = (state, { order, order: { contractCode }, liqEstimate }) => {
  const position = selectPosition(state, contractCode);
  const orderSize = order.side === ORDER_SIDE.BUY ? order.size : 0 - order.size;
  const positionSize = BigNumber(position.quantity).isFinite()
    ? BigNumber(position.quantity)
        .plus(orderSize)
        .toNumber()
    : orderSize;
  const markPrice = selectMarkPrice(state, contractCode);
  const dollarizer = selectDollarizer(state, contractCode);
  let estLiquidationPrice = positionSize
    ? selectLiquidationPriceGivenPosition(state, {
        markPrice,
        dollarizer,
        unrealizedPl: 0,
        contractCode,
        ...position,
        quantity: positionSize,
      }) || NaN
    : NaN;

  if (
    (order.side === ORDER_SIDE.BUY && estLiquidationPrice >= markPrice) ||
    (order.side === ORDER_SIDE.SELL && estLiquidationPrice <= markPrice)
  ) {
    estLiquidationPrice = undefined;
  }

  const liquidationPriceDelta = !isNaN(estLiquidationPrice)
    ? BigNumber(markPrice)
        .minus(estLiquidationPrice)
        .abs()
        .dividedBy(markPrice)
        .toNumber()
    : undefined;

  const contract = selectContractByCode(state, contractCode);
  const notional = BigNumber(order.size).multipliedBy(order.price || order.stopPrice);

  return {
    contract,
    positionSize,
    currentPosition: position.quantity || '0',
    estLiquidationPrice,
    markPrice,
    dollarizer,
    makerFee:
      order.type !== ORDER_TYPE.MARKET && notional
        ? notional
            .multipliedBy(BigNumber(contract.makerFeePct).dividedBy(100))
            .abs()
            .dp(2)
            .toNumber()
        : undefined,
    takerFee:
      order.type !== ORDER_TYPE.MARKET && notional
        ? notional
            .multipliedBy(BigNumber(contract.takerFeePct).dividedBy(100))
            .abs()
            .dp(2)
            .toNumber()
        : undefined,
    total: notional.toNumber(),
    liquidationPriceDelta,
    effectiveLeverage:
      order.type !== ORDER_TYPE.MARKET
        ? selectEffectiveLeverageGivenPosition(state, contractCode, orderSize, notional)
        : undefined,
  };
};

const mapDispatchToProps = {
  logEvent: logEventAction,
};

class ConfirmOrderModal extends Component {
  static propTypes = {
    handleConfirm: PropTypes.func.isRequired,
    handleHide: PropTypes.func.isRequired,
    order: PropTypes.object.isRequired,
    toggleConfirmation: PropTypes.func.isRequired,
  };

  handleConfirm = () => {
    const { handleConfirm, handleHide, isMobile, logEvent, order } = this.props;

    logEvent({
      action: EVENT_ACTIONS.CREATE_ORDER_CONFIRM,
      orderInfo: order,
      isMobile,
      type: EVENT_TYPES.CLICK,
    });
    handleConfirm(order);
    handleHide();
  };

  render() {
    const {
      contract: { quoteCurrency, priceDecimals, type: contractType },
      order,
      order: { side },
      markPrice,
      positionSize,
      toggleConfirmation,
      estLiquidationPrice,
      currentPosition,
      makerFee,
      takerFee,
      total,
      liquidationPriceDelta,
      effectiveLeverage,
    } = this.props;

    const { notional, ...newOrder } = order;

    const showLiq = order.type === ORDER_TYPE.MARKET || order.type === ORDER_TYPE.LIMIT;

    return (
      <ConfirmModal
        buttonClass={cn({ 'trader-btn-negative': side === ORDER_SIDE.SELL })}
        buttonText={
          side === ORDER_SIDE.SELL ? (
            <Trans i18nKey="trader.orderEntry.sell">Sell</Trans>
          ) : (
            <Trans i18nKey="trader.orderEntry.buy">Buy</Trans>
          )
        }
        className="order-confirmation-modal"
        footer={
          <ConfirmOrderToggle onConfirmationToggle={toggleConfirmation} type={TOGGLE_TYPE.HIDE} />
        }
        hideConfirmButton={false}
        message={
          <>
            <OpenOrderSummary
              condensed
              order={{
                ...newOrder,
                notional: order.type !== ORDER_TYPE.MARKET ? total : undefined,
                quoteCurrency: quoteCurrency,
              }}
              priceDecimals={priceDecimals}
              quoteCurrency={quoteCurrency}
            />
            {!!makerFee && (
              <>
                <hr />
                <OpenOrderSummary
                  condensed
                  order={{ makerFee, takerFee }}
                  priceDecimals={priceDecimals}
                  quoteCurrency={quoteCurrency}
                />
              </>
            )}
            {contractType !== CONTRACT_TYPE.SPOT && (
              <>
                <hr />
                <OpenOrderSummary
                  condensed
                  order={{ currentPosition: currentPosition, positionSize }}
                  priceDecimals={priceDecimals}
                  quoteCurrency={quoteCurrency}
                />
                <hr />
                <OpenOrderSummary
                  condensed
                  order={{
                    markPrice,
                    estLiquidationPrice: showLiq ? estLiquidationPrice : undefined,
                    showLiq,
                    liquidationPriceDelta: showLiq ? liquidationPriceDelta : undefined,
                    effectiveLeverage: showLiq ? effectiveLeverage : undefined,
                  }}
                  priceDecimals={priceDecimals}
                  quoteCurrency={quoteCurrency}
                />
              </>
            )}
          </>
        }
        onConfirm={this.handleConfirm}
        title={<Trans i18nKey="trader.orderEntry.confirmation.title">Order Confirmation</Trans>}
        wrapClassName="confirm-order-modal"
      />
    );
  }
}

export default connectModal({ name: CONFIRM_ORDER_MODAL_ID })(
  connect(mapStateToProps, mapDispatchToProps)(ConfirmOrderModal)
);
