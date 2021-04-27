import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

const SpaceGroup = ({ className, children, size }) => (
  <div
    className={cn(className, 'trader-btn-space-group', {
      'trader-btn-space-group-small': size === 'small',
      'trader-btn-space-group-large': size === 'large',
    })}
  >
    {children}
  </div>
);

SpaceGroup.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['small', 'large']),
};

export default SpaceGroup;
