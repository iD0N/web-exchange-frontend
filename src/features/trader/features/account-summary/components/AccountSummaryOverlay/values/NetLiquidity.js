import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import SummaryItem from '../components/SummaryItem';

const NetLiquidity = ({ legendColor, showLegendColor, value }) => (
  <SummaryItem
    label={<Trans i18nKey="trader.accountBalance.netLiquidity">Total Collateral</Trans>}
    tooltip={
      <Trans i18nKey="trader.accountBalance.netLiquidityDescription">
        Total token balance value plus all open P/L.
      </Trans>
    }
    legendColor={legendColor}
    showLegendColor={showLegendColor}
    value={value}
  />
);

NetLiquidity.propTypes = {
  legendColor: PropTypes.string.isRequired,
  showLegendColor: PropTypes.bool,
  value: PropTypes.string,
};

export default memo(NetLiquidity);
