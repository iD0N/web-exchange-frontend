import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { LEGEND_COLORS, ZERO_BALANCE_VALUE } from '../../../constants';
import SummaryItem from '../components/SummaryItem';

const OrderHolds = ({ value }) => (
  <SummaryItem
    label={<Trans i18nKey="trader.accountBalance.orderHolds">Order Holds</Trans>}
    tooltip={
      <Trans i18nKey="trader.accountBalance.orderHoldsDescription">
        The amount of your balance being used to hold active orders. If you close orders, this value
        will decrease and more margin will be available. If your orders are converted to open
        increased positions, this value will decrease and your initial margin requirement will
        increase. See "Help & Support" for details.
      </Trans>
    }
    legendColor={LEGEND_COLORS.YELLOW}
    showLegendColor={value !== ZERO_BALANCE_VALUE}
    value={value}
  />
);

OrderHolds.propTypes = {
  value: PropTypes.string,
};

export default memo(OrderHolds);
