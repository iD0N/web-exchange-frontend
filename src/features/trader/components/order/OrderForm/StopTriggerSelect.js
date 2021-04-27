import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { t } from '../../../../../common/services/i18n';
import { ORDER_STOP_TRIGGER, ORDER_TYPE } from '../../../../../common/enums';
import { FormItem, InfoTooltip, Select } from '../../../../../common/components/trader';

import { ORDER_STOP_TRIGGER_LABEL } from '../constants';

const triggers = () =>
  Object.entries(ORDER_STOP_TRIGGER).map(([triggerKey, value]) => ({
    value,
    label: t(ORDER_STOP_TRIGGER_LABEL[value]),
  }));

const StopTriggerSelect = ({ id, onChange, orderType, value }) =>
  orderType !== ORDER_TYPE.MARKET &&
  orderType !== ORDER_TYPE.LIMIT && (
    <FormItem
      className="order-entry-price-trigger-select"
      id={id}
      initialValue={value}
      label={
        <InfoTooltip title={<Trans i18nKey="trader.orderEntry.stopTrigger.tooltip" />}>
          <Trans i18nKey="trader.orderEntry.stopTrigger.title" />
        </InfoTooltip>
      }
    >
      <Select onChange={onChange}>
        {triggers().map(({ label, value: triggerValue }, index) => (
          <Select.Option key={index} className="stop-trigger-select-item" value={triggerValue}>
            {label}
          </Select.Option>
        ))}
      </Select>
    </FormItem>
  );

StopTriggerSelect.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.string,
};

StopTriggerSelect.defaultProps = {
  id: 'stopTrigger',
};

export default StopTriggerSelect;
