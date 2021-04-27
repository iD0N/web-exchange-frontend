import React from 'react';

import { Layout } from '../../../../../common/components/trader';

import ConnectionStatus from '../../ConnectionStatus';

const Footer = () => (
  <Layout.Footer>
    <ConnectionStatus />
  </Layout.Footer>
);

export default Footer;
