import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { Value } from '../../../../../../../common/components/trader';

const DayPl = memo(({ value }) => (
  <Value
    className="pl-trigger-value"
    label={<Trans i18nKey="trader.accountBalance.dayPl">Day P/L</Trans>}
  >
    <Value.Numeric withDirection type="currency" abbreviated value={value} />
  </Value>
));

DayPl.propTypes = {
  value: PropTypes.number,
};

export default DayPl;
