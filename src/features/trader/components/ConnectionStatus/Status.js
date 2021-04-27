import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import cn from 'classnames';
import moment from 'moment';

import { Value } from '../../../../common/components/trader';

const Status = ({ isConnecting, isOpen, isClosed, nextReconnect, showLabel }) => (
  <div className="connection-status">
    <span
      className={cn('connection-status-indicator', {
        connecting: isConnecting,
        open: isOpen,
        closed: isClosed,
      })}
    />
    {showLabel && (
      <>
        <Trans i18nKey="footer.socketStatus">Socket Status:</Trans>&nbsp;
      </>
    )}
    {isClosed &&
      (nextReconnect ? (
        <>
          <Trans i18nKey="socketStatus.reconnectingIn">Reconnecting in</Trans>
          &nbsp;
          <Value.Duration value={moment(nextReconnect)} reverted />
        </>
      ) : (
        <Trans i18nKey="socketStatus.closed">Disconnected</Trans>
      ))}
    {isOpen && <Trans i18nKey="socketStatus.open">Connected</Trans>}
    {isConnecting &&
      (nextReconnect ? (
        <Trans i18nKey="socketStatus.reconnecting">Reconnecting</Trans>
      ) : (
        <Trans i18nKey="socketStatus.connecting">Connecting</Trans>
      ))}
  </div>
);

Status.propTypes = {
  isConnecting: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  isClosed: PropTypes.bool.isRequired,
  nextReconnect: PropTypes.string,
  showLabel: PropTypes.bool,
};

export default Status;
