import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

const TextValue = ({ className, children, ...bag }) => (
  <span className={cn('trader-form-text', className)} {...bag}>
    {children}
  </span>
);

TextValue.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

TextValue.defaultProps = {
  children: <>&nbsp;</>,
};

export default TextValue;
