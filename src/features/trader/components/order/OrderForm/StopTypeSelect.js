import React from 'react';
import PropTypes from 'prop-types';

import { t } from '../../../../../common/services/i18n';
import { ORDER_TYPE } from '../../../../../common/enums';
import { FormItem, InfoTooltip, Select } from '../../../../../common/components/trader';
import { isStopOrderType } from '../../../features/orders/utils';

const stopTypes = [
  {
    value: ORDER_TYPE.STOP_LIMIT,
    label: 'trader.orderEntry.orderType.limit',
  },
  {
    value: ORDER_TYPE.STOP_MARKET,
    label: 'trader.orderEntry.orderType.market',
  },
  {
    value: ORDER_TYPE.STOP_MARKET_TRAILING,
    label: 'trader.orderEntry.orderType.trailingStopMarket',
  },
  {
    value: ORDER_TYPE.STOP_MARKET_TRAILING_PCT,
    label: 'trader.orderEntry.orderType.trailingStopMarketPercent',
  },
];
const takeTypes = [
  {
    value: ORDER_TYPE.TAKE_LIMIT,
    label: 'trader.orderEntry.orderType.limit',
  },
  {
    value: ORDER_TYPE.TAKE_MARKET,
    label: 'trader.orderEntry.orderType.market',
  },
];

const StopTypeSelect = ({ onChange, value }) =>
  isStopOrderType(value) && (
    <FormItem
      className="order-entry-price-trigger-select order-entry-price-stop-order-type-select"
      id="stopOrderType"
      initialValue={value}
      label={
        <InfoTooltip title={t('trader.orderEntry.stopType.tooltip')}>
          {t('trader.orderEntry.stopType.title', { defaultValue: 'Execute As' })}
        </InfoTooltip>
      }
    >
      <Select onChange={onChange}>
        {(stopTypes.map(a => a.value).includes(value) ? stopTypes : takeTypes).map(
          ({ label, value: typeValue }, index) => (
            <Select.Option key={index} className="stop-trigger-select-item" value={typeValue}>
              {t(label)}
            </Select.Option>
          )
        )}
      </Select>
    </FormItem>
  );

StopTypeSelect.propTypes = {
  value: PropTypes.string,
};

export default StopTypeSelect;
