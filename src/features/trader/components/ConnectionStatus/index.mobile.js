import React from 'react';
import PropTypes from 'prop-types';

import Status from './Status';

const ConnectionStatus = ({ isConnecting, isOpen, isClosed, nextReconnect }) =>
  (isConnecting && nextReconnect) || isClosed ? (
    <div className="ant-message" style={{ top: 'auto', bottom: 80 }}>
      <div className="ant-message-notice">
        <div className="ant-message-notice-content">
          <Status
            isConnecting={isConnecting}
            isOpen={isOpen}
            isClosed={isClosed}
            nextReconnect={nextReconnect}
          />
        </div>
      </div>
    </div>
  ) : null;

ConnectionStatus.propTypes = {
  isConnecting: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  isClosed: PropTypes.bool.isRequired,
  nextReconnect: PropTypes.string,
};

export default ConnectionStatus;
