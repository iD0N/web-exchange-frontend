import React, { memo } from 'react';
import PropTypes from 'prop-types';

import { t } from '../../../../../../../common/services/i18n';

import SummaryItem from '../components/SummaryItem';

const TokenBalance = ({ decimals, tokenCode, value }) => (
  <SummaryItem
    className="token-balance-value"
    label={
      <span>
        {t('trader.accountBalance.tokenBalance', {
          tokenCode,
          defaultValue: `${tokenCode} Balance`,
        })}
      </span>
    }
    type="quantity"
    decimals={decimals > 8 ? 8 : decimals}
    value={value}
  />
);

TokenBalance.propTypes = {
  value: PropTypes.string,
};

export default memo(TokenBalance);
