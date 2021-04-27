import React from 'react';
import PropTypes from 'prop-types';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { isMobile } from 'react-device-detect';

const EnhancedPerfectScrollbar = ({ children, ...bag }) => {
  if (!children) {
    return null;
  }
  if (isMobile) {
    return children;
  }
  return <PerfectScrollbar {...bag}>{children}</PerfectScrollbar>;
};

EnhancedPerfectScrollbar.propTypes = {
  children: PropTypes.node.isRequired,
};

export default EnhancedPerfectScrollbar;
