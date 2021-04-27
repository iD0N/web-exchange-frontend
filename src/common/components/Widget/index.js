import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

const Widget = ({ className, title, centered, children }) => (
  <div className={cn('widget', className, { 'widget-centered': centered })}>
    {title && <div className="widget-header">{title && <h1>{title}</h1>}</div>}
    {children}
  </div>
);

Widget.propTypes = {
  title: PropTypes.node,
  className: PropTypes.string,
  centered: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export default Widget;
