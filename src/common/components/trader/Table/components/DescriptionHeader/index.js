import React from 'react';
import PropTypes from 'prop-types';

import { Currency } from '../../../';

const DescriptionHeader = ({ children, currency }) => (
  <span className="trader-table-description-header">
    <>{children}</>
    {!!currency && <Currency inline value={currency} />}
  </span>
);

DescriptionHeader.propTypes = {
  children: PropTypes.node.isRequired,
  currency: PropTypes.string,
};

export default DescriptionHeader;
