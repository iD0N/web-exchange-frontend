import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { LEGEND_COLORS, ZERO_USD_VALUE } from '../../../constants';
import SummaryItem from '../components/SummaryItem';

const BuyingPower = ({ value }) => (
  <SummaryItem
    label={<Trans i18nKey="trader.accountBalance.buyingPower">Available Collateral</Trans>}
    tooltip={
      <Trans i18nKey="trader.accountBalance.buyingPowerDescription">
        The amount of your balance available for placing new orders and taking new positions. If
        negative, this is the amount of funds you need to deposit or otherwise make available in
        order to place new orders and grow positions. See "Help & Support" for details.
      </Trans>
    }
    legendColor={LEGEND_COLORS.GREEN}
    showLegendColor={value !== ZERO_USD_VALUE}
    value={value}
  />
);

BuyingPower.propTypes = {
  value: PropTypes.string,
};

export default memo(BuyingPower);
