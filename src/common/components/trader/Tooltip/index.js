import React from 'react';
import Tooltip from 'antd/lib/tooltip';

const TraderTooltip = ({ children, className, ...bag }) => (
  <Tooltip prefixCls="trader-tooltip" overlayClassName={className} mouseLeaveDelay={0} {...bag}>
    <span>{children}</span>
  </Tooltip>
);

export default TraderTooltip;
