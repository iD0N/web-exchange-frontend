import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

const Container = ({ children, className }) => (
  <div className={cn('container', className)}>{children}</div>
);

Container.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Container;
