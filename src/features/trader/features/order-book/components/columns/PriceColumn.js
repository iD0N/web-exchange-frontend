import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Value } from '../../../../../../common/components/trader';
import { selectPriceDecimals } from '../../ducks';

const mapStateToProps = state => ({
  decimals: selectPriceDecimals(state),
});

const PriceColumn = ({ decimals, price }) => (
  <span className="with-bg">
    {price && (
      <span className="padded-cell-span">
        <Value.Numeric type="price" value={price} decimals={decimals} />
      </span>
    )}
  </span>
);

PriceColumn.propTypes = {
  decimals: PropTypes.number.isRequired,
  price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default connect(mapStateToProps)(PriceColumn);
