import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import cn from 'classnames';

import { IsMobile } from '../../../../../../common/components';

import { selectPosition } from '../../../positions/ducks'; // TODO uplift

import NetPosition from './NetPosition';
import UnrealizedPL from './UnrealizedPL';

const mapStateToProps = (state, { contractCode }) => ({
  positionData: selectPosition(state, contractCode),
});

const PositionView = ({
  isMobile,
  isSpot,
  positionData: { averageEntryPrice, quantity, unrealizedPl },
  handleOrderQuantityChange,
}) => (
  <div className={cn('trademode-position-view', { hidden: isSpot })}>
    <NetPosition
      isMobile={isMobile}
      quantity={quantity}
      averageEntryPrice={averageEntryPrice}
      handleOrderQuantityChange={handleOrderQuantityChange}
    />
    {!isSpot && <UnrealizedPL unrealizedPl={unrealizedPl} />}
  </div>
);

PositionView.propTypes = {
  contractCode: PropTypes.string.isRequired,
  isSpot: PropTypes.bool,
  positionData: PropTypes.object.isRequired,
  handleOrderQuantityChange: PropTypes.func.isRequired,
};

export default connect(mapStateToProps)(IsMobile(PositionView));
