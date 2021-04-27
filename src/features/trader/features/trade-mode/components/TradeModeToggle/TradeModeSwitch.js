import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import { isMobile } from 'react-device-detect';

import { CheckboxSwitch } from '../../../../../../common/components/trader';

const TradeModeSwitch = ({ classPrefix, onToggle, tradeEnabled, toggleTradeMode }) => (
  <CheckboxSwitch
    size={!isMobile ? 'small' : undefined}
    checked={tradeEnabled}
    className={`${classPrefix}-trade-mode`}
    labelPlacement="left"
    onChange={() => {
      toggleTradeMode();
      onToggle && onToggle();
    }}
  >
    <Trans i18nKey="trader.tradeMode.title">Trade Mode</Trans>
  </CheckboxSwitch>
);

TradeModeSwitch.propTypes = {
  classPrefix: PropTypes.string.isRequired,
  onToggle: PropTypes.func,
  tradeEnabled: PropTypes.bool.isRequired,
  toggleTradeMode: PropTypes.func.isRequired,
};

export default memo(TradeModeSwitch);
