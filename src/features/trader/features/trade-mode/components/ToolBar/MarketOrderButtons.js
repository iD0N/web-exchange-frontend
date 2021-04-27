import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { ORDER_SIDE, ORDER_TYPE } from '../../../../../../common/enums';
import { Button } from '../../../../../../common/components/trader';

const MarketOrderButtons = ({ classPrefix, tradableQuantityIsValid, submitOrder, suffix }) => (
  <>
    <Button
      disabled={!tradableQuantityIsValid}
      ghost
      key="mkt-buy"
      upper
      className={`${classPrefix}-buy-btn`}
      type="positive"
      onClick={() => submitOrder({ side: ORDER_SIDE.BUY, type: ORDER_TYPE.MARKET })}
    >
      <div>
        <Trans i18nKey="trader.orderEntry.marketAbbreviated">MKT</Trans>{' '}
        <Trans i18nKey="trader.orderEntry.buy">Buy</Trans>
        {suffix && <>{` ${suffix}`}</>}
      </div>
    </Button>
    <Button
      disabled={!tradableQuantityIsValid}
      ghost
      key="mkt-sell"
      upper
      className={`${classPrefix}-sell-btn`}
      type="negative"
      onClick={() => submitOrder({ side: ORDER_SIDE.SELL, type: ORDER_TYPE.MARKET })}
    >
      <div>
        <Trans i18nKey="trader.orderEntry.marketAbbreviated">MKT</Trans>{' '}
        <Trans i18nKey="trader.orderEntry.sell">Sell</Trans>
        {suffix && <>{` ${suffix}`}</>}
      </div>
    </Button>
  </>
);

MarketOrderButtons.propTypes = {
  classPrefix: PropTypes.string.isRequired,
  tradableQuantityIsValid: PropTypes.bool.isRequired,
  submitOrder: PropTypes.func.isRequired,
};

export default MarketOrderButtons;
