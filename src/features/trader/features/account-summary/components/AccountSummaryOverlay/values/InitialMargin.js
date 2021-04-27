import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { LEGEND_COLORS, ZERO_BALANCE_VALUE } from '../../../constants';
import SummaryItem from '../components/SummaryItem';

const InitialMargin = ({ showLegendColor, value }) => (
  <SummaryItem
    label={<Trans i18nKey="trader.accountBalance.initialMargin">Initial Margin</Trans>}
    tooltip={
      <Trans i18nKey="trader.accountBalance.initialMarginDescription">
        The total collateral required to grow your current positions. See "Help & Support" for details.
      </Trans>
    }
    legendColor={LEGEND_COLORS.DARK_BLUE}
    showLegendColor={showLegendColor && value !== ZERO_BALANCE_VALUE}
    value={value}
  />
);

InitialMargin.propTypes = {
  showLegendColor: PropTypes.bool,
  value: PropTypes.string,
};

export default memo(InitialMargin);
