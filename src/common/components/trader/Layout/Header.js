import React from 'react';
import Layout from 'antd/lib/layout';
import cn from 'classnames';

const TraderHeader = ({ isTestnet, ...props }) => (
  <span className={cn({ 'trader-layout-header-testnet': isTestnet })}>
    <Layout.Header prefixCls="trader-layout-header" {...props} />
  </span>
);

export default TraderHeader;
