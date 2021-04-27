import React from 'react';
import PropTypes from 'prop-types';

import PerfectScrollbar from './';

const option = {
  wheelPropagation: false,
};

const StopScrollPropagation = ({ children }) => (
  <PerfectScrollbar option={option}>{children}</PerfectScrollbar>
);

StopScrollPropagation.propTypes = {
  children: PropTypes.node.isRequired,
};

export default StopScrollPropagation;
