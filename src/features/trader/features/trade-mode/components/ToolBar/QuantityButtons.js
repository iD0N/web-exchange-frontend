import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Button } from '../../../../../../common/components/trader';
import { selectTradeModeSizes } from '../../ducks';

import QuantityButton from './QuantityButton';

const mapStateToProps = (state, { contractCode }) => ({
  sizes: selectTradeModeSizes(state, contractCode),
});

const QuantityButtons = ({ orderQuantity, onQuantityChange, sizes }) => (
  <Button.SpaceGroup className="trademode-toolbar-quantity-buttons">
    {sizes.map(({ label, quantity }, i) => (
      <QuantityButton
        key={i}
        label={label}
        quantity={quantity}
        orderQuantity={orderQuantity}
        onQuantityChange={onQuantityChange}
      />
    ))}
  </Button.SpaceGroup>
);

QuantityButtons.propTypes = {
  orderQuantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  onQuantityChange: PropTypes.func.isRequired,
};

export default connect(mapStateToProps)(QuantityButtons);
