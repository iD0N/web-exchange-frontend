import React from 'react';
import PropTypes from 'prop-types';
import Button from 'antd/lib/button';
import cn from 'classnames';

import SpaceGroup from './SpaceGroup';

const TraderButton = ({ animated, className, link, noPadding, plain, size, upper, ...bag }) => (
  <Button
    className={cn(className, {
      'trader-btn-link': link,
      'trader-btn-no-padding': noPadding,
      'trader-btn-upper': upper,
      'trader-btn-md': isMedium(size),
      'trader-btn-plain': plain,
      'trader-btn-animation-disabled': !animated,
    })}
    size={isMedium(size) ? undefined : size}
    {...bag}
    prefixCls="trader-btn"
  />
);

TraderButton.propTypes = {
  animated: PropTypes.bool,
  className: PropTypes.string,
  link: PropTypes.bool,
  noPadding: PropTypes.bool,
  plain: PropTypes.bool,
  size: PropTypes.string,
  upper: PropTypes.bool,
};

TraderButton.defaultProps = {
  animated: true,
};

TraderButton.SpaceGroup = SpaceGroup;

export default TraderButton;

function isMedium(size) {
  return size === 'medium';
}
