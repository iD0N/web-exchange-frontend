import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { LEGEND_COLORS } from '../../../constants';
import SummaryItem from '../components/SummaryItem';

const LiquidationLevel = ({ showLegendColor, value }) => (
  <SummaryItem
    label={<Trans i18nKey="trader.accountBalance.liquidationLevel">Liquidation Level</Trans>}
    tooltip={
      <Trans i18nKey="trader.accountBalance.liquidationLevelDescription">
        The total collateral required to stay in your positions. If this level is breached, your entire
        portfolio will be auto-liquidated.
      </Trans>
    }
    legendColor={showLegendColor && LEGEND_COLORS.DARK_RED}
    showLegendColor
    value={value}
  />
);

LiquidationLevel.propTypes = {
  value: PropTypes.string,
};

LiquidationLevel.defaultProps = {
  showLegendColor: true,
};

export default memo(LiquidationLevel);
