import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

const FontIcon = ({ type, className, ...rest }) => {
  const computedClassName = cn(`acdx-icon icon-${type}`, className);

  return <i {...rest} className={computedClassName} />;
};

FontIcon.propTypes = {
  type: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default FontIcon;
