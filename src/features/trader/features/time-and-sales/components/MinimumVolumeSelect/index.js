import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { Select } from '../../../../../../common/components/trader';

import { MIN_TRADE_SIZE_OPTIONS } from '../../constants';

const { Option } = Select;

const options = MIN_TRADE_SIZE_OPTIONS.map(opt => (
  <Option key={opt.value} value={opt.value}>
    {opt.label}
  </Option>
));

const MinimumVolumeSelect = ({ value, onChange }) => (
  <div className="time-sales-dropdown-wrapper">
    <div className="min-volume-label">
      <Trans i18nKey="trader.timeAndSales.minTradeSize.title">Min Trade Size</Trans>:
    </div>
    <Select borderless dropdownAlign={{ points: ['br', 'tr'] }} value={value} onChange={onChange}>
      {options}
    </Select>
  </div>
);

MinimumVolumeSelect.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default memo(MinimumVolumeSelect);
