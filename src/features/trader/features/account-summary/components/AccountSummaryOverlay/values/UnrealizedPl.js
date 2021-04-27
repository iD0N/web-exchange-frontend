import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import SummaryItem from '../components/SummaryItem';

const UnrealizedPl = ({ value }) => (
  <SummaryItem
    label={<Trans i18nKey="trader.accountBalance.unrealizedPl">Unrealized P/L</Trans>}
    tooltip={
      <Trans i18nKey="trader.accountBalance.unrealizedPlDescription">
        Unrealized profit or loss (P/L) from open positions.
      </Trans>
    }
    value={value}
    withDirection
  />
);

UnrealizedPl.propTypes = {
  value: PropTypes.number,
};

export default memo(UnrealizedPl);
