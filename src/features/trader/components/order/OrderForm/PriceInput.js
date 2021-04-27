import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import cn from 'classnames';

import { ORDER_TYPE } from '../../../../../common/enums';
import { toPriceString } from '../../../../../common/utils/numberHelpers';
import {
  FormItem,
  InfoTooltip,
  InputNumber,
  Currency,
} from '../../../../../common/components/trader';
import rules from '../../../../../common/rules';
import {
  isOfLimitOrderType,
  isStopOrderType,
  isTrailingStopMarket,
} from '../../../features/orders/utils';

import StopTriggerSelect from './StopTriggerSelect';
import StopTypeSelect from './StopTypeSelect';

const getPriceLabel = (orderType, id, quoteCurrency) => {
  if (isOfLimitOrderType(orderType)) {
    if (orderType === ORDER_TYPE.LIMIT) {
      return (
        <Trans i18nKey="trader.orderEntry.price">
          Price
          <Currency value={quoteCurrency} inline />
        </Trans>
      );
    }
    if (id === 'price') {
      return (
        <Trans i18nKey="trader.orderEntry.limitPrice">
          Limit Price
          <Currency value={quoteCurrency} inline />
        </Trans>
      );
    }
  }
  if (isStopOrderType(orderType) && !isTrailingStopMarket(orderType)) {
    return (
      <InfoTooltip
        title={
          [ORDER_TYPE.STOP_MARKET, ORDER_TYPE.STOP_LIMIT].includes(orderType) ? (
            <Trans i18nKey="trader.orderEntry.triggerPrice.tooltip.stop" />
          ) : (
            <Trans i18nKey="trader.orderEntry.triggerPrice.tooltip.take" />
          )
        }
      >
        <Trans i18nKey="trader.orderEntry.triggerPrice.title">
          Trigger Price
          <Currency value={quoteCurrency} inline />
        </Trans>
      </InfoTooltip>
    );
  }
  if (orderType === ORDER_TYPE.STOP_MARKET_TRAILING) {
    return (
      <InfoTooltip title={<Trans i18nKey="trader.orderEntry.trailValue.tooltip.notional" />}>
        <Trans i18nKey="trader.orderEntry.trailValue.title">
          Trail Value
          <Currency value={quoteCurrency} inline />
        </Trans>
      </InfoTooltip>
    );
  }
  if (orderType === ORDER_TYPE.STOP_MARKET_TRAILING_PCT) {
    return (
      <InfoTooltip title={<Trans i18nKey="trader.orderEntry.trailValue.tooltip.percent" />}>
        <Trans i18nKey="trader.orderEntry.trailValue.title">Trail Value</Trans>
        <span style={{ marginLeft: 3 }}> (%)</span>
      </InfoTooltip>
    );
  }
  return null;
};

const PriceInput = ({
  decimals,
  id,
  onStopTriggerChange,
  orderType,
  quoteCurrency,
  step,
  stopTrigger,
  onStopOrderTypeChange,
  value,
}) =>
  orderType !== ORDER_TYPE.MARKET && (
    <div className={cn({ 'order-entry-price-input-wrapper': orderType !== ORDER_TYPE.LIMIT })}>
      {id === 'price' && orderType !== ORDER_TYPE.LIMIT && (
        <StopTypeSelect onChange={onStopOrderTypeChange} value={orderType} />
      )}
      {['stopPrice', 'trailValue'].includes(id) && (
        <StopTriggerSelect
          onChange={onStopTriggerChange}
          orderType={orderType}
          value={stopTrigger}
        />
      )}
      {(id === 'stopPrice' || isOfLimitOrderType(orderType) || isTrailingStopMarket(orderType)) && (
        <FormItem
          id={id}
          key={`${id}-${decimals}`}
          className="order-entry-price-input"
          initialValue={value}
          rules={
            orderType !== ORDER_TYPE.STOP_MARKET_TRAILING_PCT
              ? [rules.required, rules.multipleOf(step)]
              : [rules.required, rules.maxValue(100)]
          }
          label={getPriceLabel(orderType, id, quoteCurrency)}
        >
          <InputNumber
            placeholder={toPriceString(0, decimals)}
            precision={decimals}
            step={step}
          />
        </FormItem>
      )}
    </div>
  );

PriceInput.propTypes = {
  decimals: PropTypes.number.isRequired,
  step: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

PriceInput.defaultProps = {
  decimals: 2,
  id: 'price',
};

export default memo(PriceInput);
