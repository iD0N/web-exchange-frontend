import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { Modal } from '../../../../../../common/components/trader';
import { OrderForm } from '../../../../components';
import ContractOutagePlaceholder from '../../../../components/placeholders/ContractOutagePlaceholder';

import GlobalContractSummary from '../GlobalContractSummary';

class OrderEntry extends Component {
  static propTypes = {
    contract: PropTypes.object.isRequired,
    handleConfirmationToggle: PropTypes.func.isRequired,
    notional: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onCloseClick: PropTypes.func.isRequired,
    onNotionalSizeChange: PropTypes.func.isRequired,
    onSizeChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    orderType: PropTypes.object.isRequired,
    postOnly: PropTypes.object.isRequired,
    price: PropTypes.object.isRequired,
    reduceOnly: PropTypes.object.isRequired,
    size: PropTypes.object.isRequired,
    sizeType: PropTypes.object.isRequired,
    stopOrderType: PropTypes.object.isRequired,
    stopPrice: PropTypes.object.isRequired,
    stopTrigger: PropTypes.object.isRequired,
  };

  state = {
    key: 1,
  };

  setKey = () => this.setState({ key: this.state.key + 1 });

  render() {
    const {
      contract,
      handleConfirmationToggle,
      notional,
      onChange,
      onCloseClick,
      onNotionalSizeChange,
      onSizeChange,
      onSubmit,
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
    } = this.props;

    return (
      <Modal
        footer={null}
        onCancel={onCloseClick}
        title={<Trans i18nKey="trader.orderEntry.trade">Trade</Trans>}
        visible
        wrapClassName="order-entry-modal-wrap"
        key={this.state.key}
      >
        <div className="order-entry" id="order-entry">
          <GlobalContractSummary />
          <ContractOutagePlaceholder contract={contract.contractCode} setKey={this.setKey}>
            <OrderForm
              contract={contract}
              isMobileOrderEntry
              notional={notional}
              onConfirmationToggle={handleConfirmationToggle}
              onSubmit={(values, side) => onSubmit(values, side, onCloseClick)}
              onChange={onChange}
              onNotionalSizeChange={onNotionalSizeChange}
              onSizeChange={onSizeChange}
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
          </ContractOutagePlaceholder>
        </div>
      </Modal>
    );
  }
}

export default OrderEntry;
