import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import BigNumber from 'bignumber.js';

import { ORDER_TYPE } from '../../../../../../common/enums';
import { SIZE_TYPE } from '../../../../features/order-entry/constants';

import Buttons from './component';

const mapStateToProps = (state, ownProps) => {
  // TODO(AustinC): need to clarify this. the props returned here are sometimes bools
  // and sometimes values (that are then passed as `size` when buying and selling using
  // SIZE_TYPE NOTIONAL!)
  const { quantityEstimates, costEstimates, orderType, sizeType, sizeDecimals } = ownProps;
  if (orderType !== ORDER_TYPE.MARKET && sizeType === SIZE_TYPE.NOTIONAL) {
    return {
      canBuy: BigNumber(quantityEstimates.canBuy)
        .dp(sizeDecimals)
        .isZero()
        ? false
        : true,
      canSell: BigNumber(quantityEstimates.canSell)
        .dp(sizeDecimals)
        .isZero()
        ? false
        : true,
    };
  } else if (orderType === ORDER_TYPE.MARKET && sizeType === SIZE_TYPE.QUANTITY) {
    return costEstimates;
  } else if (orderType === ORDER_TYPE.MARKET && sizeType === SIZE_TYPE.NOTIONAL) {
    return quantityEstimates;
  } else {
    return { canBuy: true, canSell: true };
  }
};

const ButtonsContainer = props => <Buttons {...props} />;

ButtonsContainer.propTypes = {
  contractCode: PropTypes.string.isRequired,
  disableBuy: PropTypes.bool,
  disableSell: PropTypes.bool,
  canBuy: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  canSell: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  quantityEstimates: PropTypes.object.isRequired,
  costEstimates: PropTypes.object.isRequired,
  hasErrors: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isMobile: PropTypes.bool,
  notional: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  orderType: PropTypes.string.isRequired,
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  sizeType: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(ButtonsContainer);
