import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import BigNumber from 'bignumber.js';

import { Value } from '../../../../../../common/components/trader';

const NetPosition = ({ isMobile, quantity, averageEntryPrice, handleOrderQuantityChange }) => (
  <Value label={<Trans i18nKey="trader.accountBalance.netPosition">Position</Trans>}>
    <span onClick={() => handleOrderQuantityChange({ value: Math.abs(quantity) })}>
      <Value.Numeric type="quantity" value={quantity} />
      {BigNumber(averageEntryPrice).isFinite() &&
        !BigNumber(averageEntryPrice).isZero() &&
        !isMobile && (
          <span>
            @ <Value.Numeric type="price" value={averageEntryPrice || 0} />
          </span>
        )}
    </span>
  </Value>
);

NetPosition.propTypes = {
  quantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  averageEntryPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  handleOrderQuantityChange: PropTypes.func.isRequired,
};

NetPosition.defaultProps = {
  quantity: '0',
  averageEntryPrice: '0',
};

export default memo(NetPosition);
