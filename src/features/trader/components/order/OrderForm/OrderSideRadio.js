import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import cn from 'classnames';

import { ORDER_SIDE } from '../../../../../common/enums';
import { FormItem, Radio } from '../../../../../common/components/trader';

const OrderSideRadio = ({ value }) => (
  <FormItem
    className={cn('order-side-radio-wrapper', {
      'order-side-radio-wrapper-sell': value === ORDER_SIDE.SELL,
    })}
    id="side"
    initialValue={value}
  >
    <Radio.Group>
      <Radio.Button value={ORDER_SIDE.BUY}>
        <Trans i18nKey="trader.orderEntry.buy">Buy</Trans>
      </Radio.Button>
      <Radio.Button value={ORDER_SIDE.SELL} className="order-side-radio-sell">
        <Trans i18nKey="trader.orderEntry.sell">Sell</Trans>
      </Radio.Button>
    </Radio.Group>
  </FormItem>
);

OrderSideRadio.propTypes = {
  value: PropTypes.string.isRequired,
};

export default OrderSideRadio;
