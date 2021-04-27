import React from 'react';
import PropTypes from 'prop-types';

import { FormItem, Select } from '../../../../../common/components/trader';

const SizeTypeSelect = ({ id, contractCode, quoteCurrency, hideNotional, value }) => (
  <FormItem className="order-entry-size-select" id={id} initialValue={value}>
    <Select disabled>
      <Select.Option value="quantity">{contractCode}</Select.Option>
      {!hideNotional && <Select.Option value="notional">{quoteCurrency}</Select.Option>}
    </Select>
  </FormItem>
);

SizeTypeSelect.propTypes = {
  autoFocus: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

SizeTypeSelect.defaultProps = {
  autoFocus: false,
  id: 'sizeType',
};

export default SizeTypeSelect;
