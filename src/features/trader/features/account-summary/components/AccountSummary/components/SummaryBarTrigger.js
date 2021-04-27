import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import MarginBar from '../../MarginBar';

const SummaryBarTrigger = memo(props => (
  <div className="margin-bar-trigger-value">
    <label>
      <Trans i18nKey="trader.accountBalance.accountSummary">Account Summary</Trans>
    </label>
    <MarginBar condensed {...props} />
  </div>
));

SummaryBarTrigger.propTypes = {
  condensed: PropTypes.bool,
  showLiquidationBar: PropTypes.bool.isRequired,
  initialMargin: PropTypes.number.isRequired,
  orderHolds: PropTypes.number.isRequired,
  liquidationLevel: PropTypes.number.isRequired,
  maintenanceMargin: PropTypes.number.isRequired,
  netLiquidationValue: PropTypes.number.isRequired,
  netLiquidationColor: PropTypes.string.isRequired,
};

export default SummaryBarTrigger;
