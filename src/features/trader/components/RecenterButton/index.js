import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { Icon } from '../../../../common/components';
import { ToggleButton, Tooltip } from '../../../../common/components/trader';

const RecenterButton = ({ disabled, onClick }) => (
  <Tooltip title={<Trans i18nKey="trader.tradeMode.recenter">Re-center</Trans>}>
    <ToggleButton size="small" active={false} onClick={onClick} disabled={disabled}>
      <Icon type="fullscreen-exit" />
    </ToggleButton>
  </Tooltip>
);

RecenterButton.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

export default memo(RecenterButton);
