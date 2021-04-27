import React, { memo } from 'react';
import PropTypes from 'prop-types';

import { Alert, Icon } from '../../';

import { typeIcon } from './constants';

const MaintenanceBannerItem = ({ message, type }) => (
  <span className="trader-system-banner">
    <Alert
      banner
      icon={<Icon type={typeIcon[type]} />}
      message={<div>{message}</div>}
      showIcon
      type={type}
    />
  </span>
);

MaintenanceBannerItem.propTypes = {
  message: PropTypes.oneOfType([PropTypes.node, PropTypes.string]).isRequired,
  type: PropTypes.string.isRequired,
};

MaintenanceBannerItem.defaultProps = {
  message: 'Crypto is down for maintenance',
};

export default memo(MaintenanceBannerItem);
