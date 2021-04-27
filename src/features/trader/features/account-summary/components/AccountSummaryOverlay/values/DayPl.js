import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import SummaryItem from '../components/SummaryItem';

const DayPl = ({ value }) => (
  <SummaryItem
    label={<Trans i18nKey="trader.accountBalance.dayPl">Day P/L</Trans>}
    tooltip={
      <Trans i18nKey="trader.accountBalance.dayPlDescription">
        Unrealized P/L changes for the day (since midnight UTC) plus realized P/L for the day.
      </Trans>
    }
    value={value}
    withDirection
  />
);

DayPl.propTypes = {
  value: PropTypes.number,
};

export default memo(DayPl);
