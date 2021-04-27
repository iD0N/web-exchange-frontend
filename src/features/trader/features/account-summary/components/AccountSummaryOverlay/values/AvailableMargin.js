import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import SummaryItem from '../components/SummaryItem';

const AvailableMargin = ({ value }) => (
  <SummaryItem
    label={<Trans i18nKey="trader.accountBalance.availableMargin">Available Margin</Trans>}
    tooltip={
      <Trans i18nKey="trader.accountBalance.availableMarginDescription">
        The amount of your balance available for placing new orders and taking new positions. If
        negative, this is the amount of funds you need to deposit or otherwise make available in
        order to place new orders and grow positions. See "Help & Support" for details.
      </Trans>
    }
    value={value}
  />
);

AvailableMargin.propTypes = {
  value: PropTypes.string,
};

export default memo(AvailableMargin);
