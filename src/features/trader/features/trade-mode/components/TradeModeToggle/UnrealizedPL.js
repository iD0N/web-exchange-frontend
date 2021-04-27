import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { Value } from '../../../../../../common/components/trader';

const UnrealizedPL = ({ unrealizedPl }) => (
  <Value label={<Trans i18nKey="trader.accountBalance.unrealizedPl">Unrealized P/L</Trans>}>
    <Value.Numeric withDirection type="currency" abbreviated value={unrealizedPl} />
  </Value>
);

UnrealizedPL.propTypes = {
  unrealizedPl: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

UnrealizedPL.defaultProps = {
  unrealizedPl: 0,
};

export default memo(UnrealizedPL);
