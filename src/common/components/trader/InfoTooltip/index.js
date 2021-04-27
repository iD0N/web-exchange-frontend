import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Icon from 'antd/lib/icon';
import cn from 'classnames';

import TraderTooltip from '../Tooltip';

const InfoTooltip = ({ children, ...bag }) => (
  <span
    className={cn('info-tooltip', {
      'info-tooltip-highlighted': !!bag.highlighted,
      'info-tooltip-vertical': true,
    })}
  >
    {children || null}
    <TraderTooltip {...bag}>
      <Icon type="info-circle" />
    </TraderTooltip>
  </span>
);

InfoTooltip.propTypes = {
  children: PropTypes.node,
  vertical: PropTypes.bool,
};

export default memo(InfoTooltip);
