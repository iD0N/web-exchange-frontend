import BigNumber from 'bignumber.js';
import React from 'react';
import PropTypes from 'prop-types';

import { t } from '../../../../../common/services/i18n';
import { ZERO_SIZE_STRING } from '../../../constants';
import { FormItem, InputNumber } from '../../../../../common/components/trader';
import rules from '../../../../../common/rules';

const NotionalSizeInput = ({ autoFocus, decimals, id, quoteCurrency, value }) => (
  <FormItem
    className="order-entry-notional-size-form-item"
    id={id}
    initialValue={value}
    label={t('trader.orderEntry.notionalValue', {
      quoteCurrency,
      defaultValue: `Notional Value (${quoteCurrency})`,
    })}
    rules={[
      rules.positiveNumber,
      rules.multipleOf(BigNumber(10).pow(-decimals).toNumber()),
    ]}
  >
    <InputNumber
      autoFocus={autoFocus}
      min={0}
      precision={decimals}
      placeholder={ZERO_SIZE_STRING}
      step={1}
    />
  </FormItem>
);

NotionalSizeInput.propTypes = {
  autoFocus: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

NotionalSizeInput.defaultProps = {
  autoFocus: false,
  id: 'notional',
};

export default NotionalSizeInput;
