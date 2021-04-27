import React from 'react';
import PropTypes from 'prop-types';
import Divider from 'antd/lib/divider';
import cn from 'classnames';

const EnhancedDivider = ({ plain, className, ...props }) => {
  const computedClassName = cn(className, {
    'ant-divider-plain': plain,
  });

  return <Divider {...props} className={computedClassName} />;
};

EnhancedDivider.propTypes = {
  plain: PropTypes.bool,
};

export default EnhancedDivider;
