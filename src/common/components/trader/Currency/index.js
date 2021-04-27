import React, { memo } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import { CURRENCY_CODE } from '../../../enums';

const Currency = ({ inline, value, parens = true }) => (
  <span className={cn('currency', { 'currency-inline': inline })}>
    {parens ? `(${value})` : value}
  </span>
);

Currency.propTypes = {
  inline: PropTypes.bool,
  value: PropTypes.string,
};

Currency.defaultProps = {
  value: CURRENCY_CODE.USD,
};

export default memo(Currency);
