import React from 'react';
import { connect } from 'react-redux';
import BigNumber from 'bignumber.js';

import { Value } from '../../../common/components/trader';
import { selectMarkPrice } from '../../trader/data-store/ducks';

const mapStateToProps = (state, { contractCode, defaultMarkPrice, referencePrice }) => {
  const markPrice = selectMarkPrice(state, contractCode) || defaultMarkPrice;
  return {
    percentChange: BigNumber(markPrice)
      .minus(referencePrice)
      .dividedBy(referencePrice)
      .toNumber(),
  };
};

const PercentChangeValue = ({ decimals, percentChange }) =>
  !Number.isNaN(percentChange) && (
    <Value.Numeric
      decimals={decimals || 4}
      type="percentage"
      withDirection
      withSign
      value={percentChange}
    />
  );

export default connect(mapStateToProps)(PercentChangeValue);
