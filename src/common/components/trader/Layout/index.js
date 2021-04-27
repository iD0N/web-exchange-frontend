import React from 'react';
import Layout from 'antd/lib/layout';

import Header from './Header';
import Content from './Content';
import Footer from './Footer';

const TraderLayout = props => <Layout prefixCls="trader-layout" {...props} />;

TraderLayout.Header = Header;
TraderLayout.Content = Content;
TraderLayout.Footer = Footer;

export default TraderLayout;
