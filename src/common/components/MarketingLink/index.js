import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

// import config from '../../../config';

// const { baseURL } = config();

const MarketingLink = ({ to, i18n, blank, children }) => (
  <a
    href={`${to}`}
    target={blank ? '_blank' : '_self'}
    rel="noopener noreferrer"
  >
    {children}
  </a>
);

MarketingLink.propTypes = {
  to: PropTypes.string.isRequired,
  i18n: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  blank: PropTypes.bool,
};

export default translate()(MarketingLink);
