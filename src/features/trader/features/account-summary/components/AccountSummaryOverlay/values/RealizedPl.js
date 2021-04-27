import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import SummaryItem from '../components/SummaryItem';

const RealizedPl = ({ value }) => (
  <SummaryItem
    label={<Trans i18nKey="trader.accountBalance.realizedPl">Realized P/L</Trans>}
    tooltip={
      <Trans i18nKey="trader.accountBalance.realizedPlDescription">
        Realized profit or loss (P/L) from open positions that have been closed or partially closed
        during the current day (since midnight UTC).
      </Trans>
    }
    value={value}
    withDirection
  />
);

RealizedPl.propTypes = {
  value: PropTypes.number,
};

export default memo(RealizedPl);
