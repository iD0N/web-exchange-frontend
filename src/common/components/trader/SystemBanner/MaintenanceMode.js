import React, { memo } from 'react';
import PropTypes from 'prop-types';

import MaintenanceModeItem from './MaintenanceModeItem';

const MaintenanceBanner = ({
  connectionInfo: { connected, maintenance, offline, ...variation },
  flagKey,
  type,
}) =>
  offline ? (
    <MaintenanceModeItem message={'You are offline. Check your internet connection.'} type={type} />
  ) : (
    (maintenance || !connected) && <MaintenanceModeItem message={variation.message} type={type} />
  );

MaintenanceBanner.propTypes = {
  connectionInfo: PropTypes.object.isRequired,
  flagKey: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

export default memo(MaintenanceBanner);
