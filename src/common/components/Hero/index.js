import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

const Hero = ({ className, children }) => <div className={cn('hero', className)}>{children}</div>;

Hero.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Hero;
