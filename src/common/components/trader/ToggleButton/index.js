import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import Button from '../Button';

const ToggleButton = ({ active, children, animated, ...props }) => (
  <Button
    {...props}
    className={cn({
      'trader-btn-toggle-active': active,
      'trader-btn-animation-disabled': !animated,
    })}
    type="toggle"
    plain
  >
    {children}
  </Button>
);

ToggleButton.propTypes = {
  active: PropTypes.bool.isRequired,
  animated: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

ToggleButton.defaultProps = {
  animated: true,
};

export default ToggleButton;
