import React, { memo } from 'react';
import { Trans } from 'react-i18next';

import { Value } from '../../../../../../../common/components/trader';

import SummaryItem from '../components/SummaryItem';

const EffectiveLeverage = ({ value }) => (
  <SummaryItem
    className="effective-leverage-value"
    label={<Trans i18nKey="trader.accountBalance.effectiveLeverage">Effective Leverage</Trans>}
    tooltip={
      <Trans i18nKey="trader.accountBalance.effectiveLeverageDescription">
        Effective Leverage is the total market value of all positions divided by account value (net
        liquidity).
      </Trans>
    }
    showLegendColor={false}
    value={
      Number.isNaN(value) ? (
        <Trans i18nKey="trader.orderEntry.maxNA" />
      ) : (
        <>
          <Value.Numeric type="size" decimals={2} value={value} />
          <span className="trader-form-text">x</span>
        </>
      )
    }
    overrideValue
  />
);

export default memo(EffectiveLeverage);
