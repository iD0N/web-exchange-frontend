import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import Switch from '../Switch';

const TraderCheckboxSwitch = ({ children, labelPlacement, ...props }) => (
  <label
    className={cn('trader-checkbox-switch', {
      'trader-checkbox-switch-label-left': labelPlacement === 'left',
    })}
  >
    <Switch {...props} />
    {children && <span>{children}</span>}
  </label>
);

TraderCheckboxSwitch.propTypes = {
  children: PropTypes.node,
  labelPlacement: PropTypes.string,
};

export default TraderCheckboxSwitch;
