import React from 'react';
import { connect } from 'react-redux';

import { Value } from '../../../common/components/trader';
import { selectMarkPrice } from '../../trader/data-store/ducks';

const mapStateToProps = (state, { contractCode, value }) => ({
  markPrice: selectMarkPrice(state, contractCode) || value,
});

const MarkPriceValue = ({ priceDecimals, markPrice }) => (
  <div className="dashboard-table-price">
    <Value.Numeric decimals={priceDecimals} type="currency" noPrefix value={markPrice} />
  </div>
);

export default connect(mapStateToProps)(MarkPriceValue);
