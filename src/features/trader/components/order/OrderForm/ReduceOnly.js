import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { Checkbox, FormItem, InfoTooltip, Value } from '../../../../../common/components/trader';

const ReduceOnly = ({ onReduceOnlyChange, value }) => (
  <span className="reduce-only-checkbox-wrapper">
    <FormItem id="reduceOnly" initialValue={value}>
      <Checkbox
        checked={value}
        onChange={() => {
          if (onReduceOnlyChange) {
            onReduceOnlyChange(!value);
          }
        }}
      >
        <InfoTooltip title={<Trans i18nKey="trader.orderEntry.reduceOnly.tooltip" />}>
          <Value.Text>
            <Trans i18nKey="trader.orderEntry.reduceOnly.title">Reduce-only</Trans>
          </Value.Text>
        </InfoTooltip>
      </Checkbox>
    </FormItem>
  </span>
);

ReduceOnly.propTypes = {
  value: PropTypes.bool,
};

export default ReduceOnly;
