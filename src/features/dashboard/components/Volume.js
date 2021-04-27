import React from 'react';

import { Value } from '../../../common/components/trader';

const Volume = ({ priceDecimals, value }) => (
  <div className="dashboard-table-price">
    <Value.Numeric decimals={priceDecimals} type="currency" noPrefix value={value} />
  </div>
);

export default Volume;