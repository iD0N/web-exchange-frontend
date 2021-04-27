import React from 'react';
import PropTypes from 'prop-types';
import Layout from 'antd/lib/layout';

import Container from '../Container';
import GlobalSpinner from '../GlobalSpinner';

const Content = ({ children }) => (
  <Layout.Content>
    <Container>
      <GlobalSpinner>{children}</GlobalSpinner>
    </Container>
  </Layout.Content>
);

Content.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Content;
