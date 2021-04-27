import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import cn from 'classnames';

import { CONTRACT_TYPE, ORDER_TYPE, ORDER_SIDE } from '../../../../../common/enums';
import { FormScreen } from '../../../../../common/components';
import { Form } from '../../../../../common/components/trader';

import { selectMaxBuySellFactory } from '../../../features/account-summary/ducks'; // TODO uplift
import ConfirmOrderToggle, {
  TOGGLE_TYPE,
} from '../../../features/order-entry/components/ConfirmOrderModal/components/ConfirmOrderToggle'; // TODO uplift
import { SIZE_TYPE } from '../../../features/order-entry/constants';
import {
  selectCostEstimateFactory,
  selectQuantityEstimateFactory,
  selectLiquidationEstimateFactory,
} from '../../../features/order-entry/ducks';
import { selectPositionQuantity } from '../../../features/positions/ducks';
import { isStopOrderType } from '../../../features/orders/utils';
import EstLiquidationValues from './EstLiquidationValues';
import SizeInput from './SizeInput';
import NotionalSizeInput from './NotionalSizeInput';
import PriceInput from './PriceInput';
import OrderTypeRadio from './OrderTypeRadio';
import SizeEstimateValue from './SizeEstimateValue';
import NotionalEstimateValue from './NotionalEstimateValue';
import OrderValue from './OrderValue';
import SizeTypeSelect from './SizeTypeSelect';
import MaxBuySell from './MaxBuySell';
import PostOnly from './PostOnly';
import ReduceOnly from './ReduceOnly';
import Buttons from './Buttons';

const fieldKeys = [
  'notional',
  'orderType',
  'price',
  'reduceOnly',
  'size',
  'sizeType',
  'stopTrigger',
  'stopPrice',
  'stopOrderType',
  'trailValue',
];

const mapPropsToFields = props =>
  fieldKeys.reduce((map, key) => ({ ...map, [key]: Form.createFormField({ ...props[key] }) }), {});

const onFieldsChange = (props, changedFields) => {
  if (!!changedFields['stopOrderType']) {
    if (
      [ORDER_TYPE.STOP_MARKET_TRAILING, ORDER_TYPE.STOP_MARKET_TRAILING_PCT].includes(
        changedFields['stopOrderType'].value
      )
    ) {
      changedFields['orderType'] = { value: ORDER_TYPE.STOP_MARKET };
      changedFields['sizeType'] = { value: 'quantity' };
    } else {
      changedFields['orderType'] = changedFields['stopOrderType'];
    }
  }
  props.onChange(changedFields);
};

const makeMapStateToProps = (_, ownProps) => {
  // get instances of selectors private to this component (and this component _instance_)

  const selectQuantityEstimate = selectQuantityEstimateFactory();
  const selectCostEstimate = selectCostEstimateFactory();

  // if this is a Modify Order form, pass this order's quantity to exclude it from
  // from max buy/sell calculations
  const { modifyOrderQuantity } = ownProps;
  const selectMaxBuySell = selectMaxBuySellFactory(modifyOrderQuantity);

  const selectLiquidationEstimate = selectLiquidationEstimateFactory({
    selectMaxBuySell,
    selectCostEstimate,
  });

  return (state, ownProps) => {
    // get quantity and cost estimates
    const {
      contract: { contractCode },
      notional: notionalRaw,
      size: sizeRaw,
    } = ownProps;
    const notional = notionalRaw.errors ? undefined : notionalRaw.value;
    const size = sizeRaw.errors ? undefined : sizeRaw.value;
    const quantityEstimates = selectQuantityEstimate(state, contractCode, notional);
    const costEstimates = selectCostEstimate(state, contractCode, size);

    // get liquidation price estimates
    const {
      orderType: { value: orderType },
      sizeType: { value: sizeType },
    } = ownProps;
    const liqEstimates =
      !!size && (orderType === ORDER_TYPE.MARKET || orderType === ORDER_TYPE.LIMIT)
        ? selectLiquidationEstimate(state, contractCode, size, sizeType, orderType)
        : { afterBuy: undefined, afterSell: undefined };

    // get max buy/sell
    const maxBuySell = selectMaxBuySell(state, contractCode);

    // load current position
    const positionQuantity = selectPositionQuantity(state, contractCode);

    return {
      quantityEstimates,
      costEstimates,
      liqEstimates,
      maxBuySell,
      positionQuantity,
    };
  };
};

const OrderForm = ({
  buttonsNotRendered,
  condensed,
  contract,
  contract: {
    contractCode,
    minimumQuantity: sizeMinimum,
    minimumPriceIncrement: priceStep,
    priceDecimals,
    quantityStep: sizeStep,
    quoteCurrency,
    seriesCode,
    sizeDecimals,
    type: contractType,
    underlying,
  },
  form,
  isMobileOrderEntry,
  isModify,
  maxBuySell,
  maxBuySellDisabled,
  modifyOrderSide,
  modifyOrderQuantity,
  modifyOrderPrice,
  notional,
  onConfirmationToggle,
  onNotionalSizeChange,
  onPostOnlyChange,
  onStopTriggerChange,
  onReduceOnlyChange,
  onSizeChange,
  onStopOrderTypeChange,
  onSubmit,
  orderId,
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
  quantityEstimates,
  costEstimates,
  liqEstimates,
  positionQuantity,
}) => (
  <FormScreen form={form} onSubmit={onSubmit}>
    {({ hasErrors, handleSubmit }) => (
      <div className={cn('order-form', { [`order-form-${orderType.value}`]: true })}>
        <Form>
          <OrderTypeRadio value={orderType.value} condensed={condensed} />
          <span className="order-form-inputs">
            <div className="size-notional-select-wrapper">
              <SizeTypeSelect
                contractCode={underlying}
                hideNotional={
                  stopOrderType && stopOrderType.value === ORDER_TYPE.STOP_MARKET_TRAILING
                }
                quoteCurrency={quoteCurrency}
                value={sizeType.value}
              />
              {sizeType.value === SIZE_TYPE.QUANTITY ? (
                <SizeInput
                  value={size.value}
                  step={sizeStep}
                  decimals={sizeDecimals}
                  minimum={Number(sizeMinimum)}
                  underlying={underlying}
                  contractCode={contractCode}
                  // only show quantity in modify form if the order side is opposite the current position
                  positionQuantity={
                    !isModify ||
                    (modifyOrderSide === ORDER_SIDE.BUY && BigNumber(positionQuantity).lt(0)) ||
                    (modifyOrderSide === ORDER_SIDE.SELL && BigNumber(positionQuantity).gt(0))
                      ? positionQuantity
                      : null
                  }
                  onChange={
                    sizeType.value === SIZE_TYPE.QUANTITY ? onSizeChange : onNotionalSizeChange
                  }
                />
              ) : (
                <NotionalSizeInput
                  decimals={priceDecimals}
                  quoteCurrency={quoteCurrency}
                  value={notional.value}
                />
              )}
            </div>
            {!maxBuySellDisabled && (
              <MaxBuySell
                onChange={
                  sizeType.value === SIZE_TYPE.QUANTITY ? onSizeChange : onNotionalSizeChange
                }
                contractCode={contractCode}
                type={contractType}
                underlying={underlying}
                quoteCurrency={quoteCurrency}
                priceDecimals={priceDecimals}
                sizeDecimals={sizeDecimals}
                decimals={sizeType.value === SIZE_TYPE.QUANTITY ? sizeDecimals : priceDecimals}
                sizeType={sizeType.value}
                inputPrice={price.value}
                orderType={orderType.value}
                modifyOrderSide={modifyOrderSide}
                modifyOrderQuantity={modifyOrderQuantity}
                modifyOrderPrice={modifyOrderPrice}
                maxBuySell={maxBuySell}
                isPostOnly={postOnly.value}
              />
            )}
            {orderType.value !== ORDER_TYPE.MARKET && (
              <PriceInput
                decimals={priceDecimals}
                orderType={orderType.value}
                step={priceStep}
                onStopTriggerChange={onStopTriggerChange}
                onStopOrderTypeChange={onStopOrderTypeChange}
                quoteCurrency={quoteCurrency}
                stopTrigger={stopTrigger.value}
                value={price.value}
              />
            )}
            {isStopOrderType(orderType.value) && (
              <PriceInput
                id={
                  orderType.value === ORDER_TYPE.STOP_MARKET &&
                  stopOrderType.value !== ORDER_TYPE.STOP_MARKET
                    ? 'trailValue'
                    : 'stopPrice'
                }
                decimals={priceDecimals}
                orderType={stopOrderType.value}
                step={priceStep}
                onStopTriggerChange={onStopTriggerChange}
                quoteCurrency={quoteCurrency}
                stopTrigger={stopTrigger.value}
                onStopOrderTypeChange={onStopOrderTypeChange}
                value={
                  orderType.value === ORDER_TYPE.STOP_MARKET &&
                  stopOrderType.value !== ORDER_TYPE.STOP_MARKET
                    ? trailValue.value
                    : stopPrice.value
                }
              />
            )}
            {orderType.value !== ORDER_TYPE.MARKET ? (
              orderType.value === ORDER_TYPE.LIMIT && (
                contractType !== CONTRACT_TYPE.FUTURE_SPREAD ?
                <OrderValue
                  contractCode={underlying}
                  notional={notional.value}
                  price={form.getFieldValue('price')}
                  priceDecimals={priceDecimals}
                  quoteCurrency={quoteCurrency}
                  size={form.getFieldValue('size')}
                  sizeType={sizeType.value}
                  sizeDecimals={sizeDecimals}
                />
                : null
              )
            ) : sizeType.value === SIZE_TYPE.NOTIONAL ? (
              contractType !== CONTRACT_TYPE.FUTURE_SPREAD ?
              <SizeEstimateValue
                modifyOrderSide={modifyOrderSide}
                contractCode={contractCode}
                underlying={underlying}
                sizeDecimals={sizeDecimals}
                notional={notional.value}
                estimate={quantityEstimates}
              />
              : null
            ) : (
              contractType !== CONTRACT_TYPE.FUTURE_SPREAD ?
              <NotionalEstimateValue
                modifyOrderSide={modifyOrderSide}
                contractCode={contractCode}
                size={size.value}
                quoteCurrency={quoteCurrency}
                priceDecimals={priceDecimals}
                inputSize={size.value}
                estimate={costEstimates}
              /> 
              : null
            )}
            { contractType !== CONTRACT_TYPE.SPOT &&
              contractType !== CONTRACT_TYPE.FUTURE_SPREAD && (
              <EstLiquidationValues
                modifyOrderSide={modifyOrderSide}
                orderType={orderType.value}
                size={size.value}
                priceDecimals={priceDecimals}
                liqEstimates={liqEstimates}
              />
            )}
            {isMobileOrderEntry && (
              <Form.Item>
                <ConfirmOrderToggle
                  onConfirmationToggle={onConfirmationToggle}
                  type={TOGGLE_TYPE.SHOW}
                />
              </Form.Item>
            )}
            {orderType.value !== ORDER_TYPE.MARKET && contractType !== CONTRACT_TYPE.SPOT && (
              <div className="pair-block">
                {contractType !== CONTRACT_TYPE.FUTURE_SPREAD ?
                  <ReduceOnly onReduceOnlyChange={onReduceOnlyChange} value={reduceOnly.value} />
                  : null
                }
                <PostOnly onPostOnlyChange={onPostOnlyChange} value={postOnly.value} />
              </div>
            )}
          </span>
        </Form>
        {!buttonsNotRendered && (
          <Buttons
            hasErrors={hasErrors || !validateInputs(
              sizeType.value,
              size.value,
              notional.value,
              orderType.value,
              stopOrderType.value,
              price.value,
              stopPrice.value,
              trailValue.value,
            )}
            contractCode={contractCode}
            handleSubmit={handleSubmit}
            isModify={isModify}
            modifyOrderSide={modifyOrderSide}
            modifyOrderQuantity={modifyOrderQuantity}
            modifyOrderPrice={modifyOrderPrice}
            notional={notional.value}
            orderId={orderId}
            orderType={orderType.value}
            price={price.value}
            size={size.value}
            sizeDecimals={sizeDecimals}
            sizeType={sizeType.value}
            underlying={contractType === CONTRACT_TYPE.SPOT ? underlying : undefined}
            quantityEstimates={quantityEstimates}
            costEstimates={costEstimates}
            liqEstimates={liqEstimates}
            isPostOnly={postOnly.value}
          />
        )}
      </div>
    )}
  </FormScreen>
);

const nonStopOrderTypes = [ORDER_TYPE.LIMIT, ORDER_TYPE.MARKET];

const fieldReqsByOrderType = {
  [ORDER_TYPE.LIMIT]: { price: true },
  [ORDER_TYPE.MARKET]: {},
  [ORDER_TYPE.STOP_LIMIT]: { price: true, stopPrice: true },
  [ORDER_TYPE.STOP_MARKET]: { stopPrice: true },
  [ORDER_TYPE.STOP_MARKET_TRAILING]: { trailValue: true },
  [ORDER_TYPE.STOP_MARKET_TRAILING_PCT]: { trailValue: true },
  [ORDER_TYPE.TAKE_LIMIT]: { price: true, stopPrice: true },
  [ORDER_TYPE.TAKE_MARKET]: { stopPrice: true },
}

function validateInputs(
  sizeType,
  size,
  notional,
  orderType,
  stopOrderType,
  price,
  stopPrice,
  trailValue,
) {
  if (sizeType === SIZE_TYPE.QUANTITY ? !size : !notional)
    return false;

  const specificOrderType = nonStopOrderTypes.includes(orderType)
    ? orderType
    : stopOrderType;

  const reqs = fieldReqsByOrderType[specificOrderType];

  // if (reqs.price && !price)
  //   return false;

  // if (reqs.stopPrice && !stopPrice)
  //   return false;

  if (reqs.trailValue && !trailValue)
    return false;

  return true;
}

OrderForm.propTypes = {
  condensed: PropTypes.bool,
  contract: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  isMobileOrderEntry: PropTypes.bool,
  isModify: PropTypes.bool,
  maxBuySell: PropTypes.object.isRequired,
  maxBuySellDisabled: PropTypes.bool,
  modifyOrderSide: PropTypes.string,
  modifyOrderQuantity: PropTypes.object,
  onConfirmationToggle: PropTypes.func,
  onNotionalSizeChange: PropTypes.func.isRequired,
  onSizeChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  orderType: PropTypes.object.isRequired,
  price: PropTypes.object.isRequired,
  size: PropTypes.object.isRequired,
  sizeType: PropTypes.object.isRequired,
  notional: PropTypes.object.isRequired,
  quantityEstimates: PropTypes.object.isRequired,
  costEstimates: PropTypes.object.isRequired,
  liqEstimates: PropTypes.object.isRequired,
  positionQuantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

OrderForm.defaultProps = {
  sizeType: { value: SIZE_TYPE.QUANTITY },
};

OrderForm.fieldKeys = fieldKeys;

export default Form.create({
  mapPropsToFields,
  onFieldsChange,
})(connect(makeMapStateToProps)(OrderForm));
