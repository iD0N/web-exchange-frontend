import React from 'react';
import { Trans } from 'react-i18next';

const Empty = () => (
  <div className="notification-wrapper-outer-outer">
    <div className="notification-wrapper-outer">
      <div className="notification-wrapper notification-tray-empty">
        <div className="notification-wrapper-inner">
          <Trans i18nKey="trader.notifications.empty">
            You have no notifications at this time.
          </Trans>
        </div>
      </div>
    </div>
  </div>
);

export default Empty;
