import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import SummaryItem from '../components/SummaryItem';

const TotalPl = ({ value }) => (
  <SummaryItem
    label={<Trans i18nKey="trader.accountBalance.totalPl">Total P/L</Trans>}
    tooltip={
      <Trans i18nKey="trader.accountBalance.totalPlDescription">
        Unrealized P/L plus realized P/L.
      </Trans>
    }
    value={value}
    withDirection
  />
);

TotalPl.propTypes = {
  value: PropTypes.number,
};

export default memo(TotalPl);
