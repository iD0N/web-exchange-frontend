import React from 'react';
import PropTypes from 'prop-types';

import { IsMobile } from '../../';
import IsLoggedIn from '../../../services/user/IsLoggedIn';

import MaintenanceMode from './MaintenanceMode';
import SystemBannerItem from './SystemBannerItem';
import BonusBanner from './BonusBanner';

const SystemBanner = ({
  connectionInfo,
  connectionInfo: { offline, maintenance, connected },
  isLoggedIn,
  isMobile,
  noInfoBanners,
}) =>
  !isMobile && (
    <>
      <MaintenanceMode
        connectionInfo={connectionInfo}
        flagKey="operations-outage-down"
        type="warning"
      />
      {!noInfoBanners && !offline && !maintenance && connected && (
        <>
          <SystemBannerItem flagKey="system-message-downtime" type="error" />
          <BonusBanner isLoggedIn={isLoggedIn} />
          <SystemBannerItem flagKey="system-message-info" type="info" />
          {isLoggedIn && <SystemBannerItem flagKey="system-waitlist-info" type="success" />}
        </>
      )}
    </>
  );

SystemBanner.propTypes = {
  connectionInfo: PropTypes.object,
  isMobile: PropTypes.bool,
  noInfoBanners: PropTypes.bool,
};

export default IsMobile(IsLoggedIn(SystemBanner));
