import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { connectModal } from 'redux-modal';
import { Trans } from 'react-i18next';
import BigNumber from 'bignumber.js';
import pick from 'lodash.pick';

import { ORDER_SIDE } from '../../../../../../common/enums';
import AlertService from '../../../../../../common/services/alert';
import { Modal } from '../../../../../../common/components/trader';
import { OrderForm } from '../../../../components';
import { selectContractByCode } from '../../../../data-store/ducks';

import { modifyOpenOrderAction } from '../../ducks';
import { orderToFormValues } from '../../utils';
import { MODIFY_ORDER_MODAL_ID } from '../../constants';
import OpenOrderSummary from '../OpenOrderSummary';

const mapStateToProps = (state, { order: { contractCode } }) => ({
  contract: selectContractByCode(state, contractCode),
});

const mapDispatchToProps = {
  modifyOrder: modifyOpenOrderAction,
};

class ModifyOrderModal extends Component {
  static propTypes = {
    contract: PropTypes.object.isRequired,
    handleHide: PropTypes.func.isRequired,
    modifyOrder: PropTypes.func.isRequired,
    order: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
  };

  state = orderToFormValues(this.props.order);

  handleChange = update => this.setState(pick(update, OrderForm.fieldKeys));

  handleSubmit = ({
    notional,
    orderType,
    postOnly,
    price,
    reduceOnly,
    size,
    stopOrderType,
    sizeType,
    stopPrice,
    stopTrigger,
    trailValue,
  }) => {
    const {
      contract: { contractCode, isExpired },
      handleHide,
      modifyOrder,
      order: { orderId, side },
    } = this.props;

    if (isExpired) {
      return AlertService.error('Cannot place orders for expired contract.');
    }

    modifyOrder({
      contractCode,
      notional,
      orderId,
      orderType,
      postOnly,
      price,
      reduceOnly,
      side,
      size,
      sizeType,
      stopPrice,
      stopTrigger,
      stopOrderType,
      trailValue,
    });

    handleHide();
  };

  handleSizeChange = value => this.setState({ size: { value } });

  handleNotionalSizeChange = value => this.setState({ notional: { value } });

  handleStopOrderTypeChange = () => this.setState({ trailValue: { value: undefined } });

  handleStopTriggerChange = value => this.setState({ stopTrigger: { value } });

  handlePostOnlyChange = value => this.setState({ postOnly: { value } });

  handleReduceOnlyChange = value => this.setState({ reduceOnly: { value } });

  render() {
    const { contract, handleHide, order, show } = this.props;
    const {
      notional,
      orderType,
      postOnly,
      price,
      reduceOnly,
      size,
      sizeType,
      stopOrderType,
      stopPrice,
      stopTrigger,
      trailValue,
    } = this.state;
    const {
      stopPrice: originalStopPrice,
      stopTrigger: originalStoptrigger,
      postOnly: originalPostOnly,
      reduceOnly: originalReduceOnly,
      ...noStoporder
    } = order;

    return (
      <Modal
        centered
        footer={null}
        onCancel={handleHide}
        title={<Trans i18nKey="trader.modifyOrder.title">Modify Order</Trans>}
        visible={show}
        width={660}
        wrapClassName="modify-order-modal"
      >
        <OpenOrderSummary key={1} order={noStoporder} />
        <OrderForm
          contract={contract}
          isModify
          modifyOrderSide={order.side}
          modifyOrderQuantity={
            // convert string `size` to signed BigNumber
            order.side === ORDER_SIDE.BUY ? BigNumber(order.size) : BigNumber(order.size).negated()
          }
          modifyOrderPrice={order.price}
          notional={notional}
          onChange={this.handleChange}
          onSizeChange={this.handleSizeChange}
          onStopTriggerChange={this.handleStopTriggerChange}
          onNotionalSizeChange={this.handleNotionalSizeChange}
          onPostOnlyChange={this.handlePostOnlyChange}
          onReduceOnlyChange={this.handleReduceOnlyChange}
          onStopOrderTypeChange={this.handleStopOrderTypeChange}
          orderId={order.orderId}
          onSubmit={this.handleSubmit}
          orderType={orderType}
          postOnly={postOnly}
          price={price}
          reduceOnly={reduceOnly}
          size={size}
          sizeType={sizeType}
          stopOrderType={stopOrderType}
          stopPrice={stopPrice}
          stopTrigger={stopTrigger}
          trailValue={trailValue}
        />
      </Modal>
    );
  }
}

export default connectModal({ name: MODIFY_ORDER_MODAL_ID })(
  connect(mapStateToProps, mapDispatchToProps)(ModifyOrderModal)
);
