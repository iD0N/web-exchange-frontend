import React from 'react';
import PropTypes from 'prop-types';

const WidgetHeader = ({ title }) => <div className="widget-title">{title}</div>;

WidgetHeader.propTypes = {
  title: PropTypes.node.isRequired,
};

export default WidgetHeader;
