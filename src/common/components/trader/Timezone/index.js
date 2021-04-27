import React, { memo } from 'react';
import moment from 'moment-timezone';

const Timezone = () => (
  <span className="timezone">{`(${moment.tz(moment.tz.guess()).zoneAbbr()})`}</span>
);

export default memo(Timezone);
