import React from 'react';
import PropTypes from 'prop-types';

import Status from './Status';

const ConnectionStatus = ({ isConnecting, isOpen, isClosed, nextReconnect }) => (
  <Status
    isConnecting={isConnecting}
    isOpen={isOpen}
    isClosed={isClosed}
    nextReconnect={nextReconnect}
    showLabel
  />
);

ConnectionStatus.propTypes = {
  isConnecting: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  isClosed: PropTypes.bool.isRequired,
  nextReconnect: PropTypes.string,
};

export default ConnectionStatus;
