import React from 'react';
import PropTypes from 'prop-types';
import Layout from 'antd/lib/layout';

import PerfectScrollbar from '../PerfectScrollbar';

const TraderContent = ({ children, ...bag }) => (
  <Layout.Content prefixCls="trader-layout-content" {...bag}>
    <PerfectScrollbar>{children}</PerfectScrollbar>
  </Layout.Content>
);

TraderContent.propTypes = {
  children: PropTypes.node.isRequired,
};

export default TraderContent;
