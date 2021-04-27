import React, { memo } from 'react';
import PropTypes from 'prop-types';

import { ORDER_TYPE } from '../../../../../../common/enums';
import { Radio } from '../../../../../../common/components/trader';
import { ORDER_TYPE_ABBREVIATIONS } from '../../../../constants';

const orderTypes = [ORDER_TYPE.LIMIT, ORDER_TYPE.STOP_MARKET, ORDER_TYPE.TAKE_MARKET];

const orderTypeButtons = orderTypes.map(orderType => (
  <Radio.Button key={orderType} value={orderType}>
    {ORDER_TYPE_ABBREVIATIONS[orderType]}
  </Radio.Button>
));

const OrderTypeRadio = ({ onChange, type }) => (
  <>
    <Radio.Group value={type} onChange={onChange}>
      {orderTypeButtons}
    </Radio.Group>
  </>
);

OrderTypeRadio.propTypes = {
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
};

export default memo(OrderTypeRadio);
