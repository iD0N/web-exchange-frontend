import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { t } from '../../../../../../common/services/i18n';
import { Button, Tooltip } from '../../../../../../common/components/trader';
import { RecenterButton } from '../../../../components';

import {
  selectOrderBookIsEmpty,
  recenterDepthAction,
  selectCanRecenter,
  incrementAggregationAction,
  decrementAggregationAction,
  selectAggregation,
  selectIsMinAggregation,
  selectIsMaxAggregation,
  selectTradeEnabled,
} from '../../ducks';

const mapStateToProps = state => ({
  canRecenter: selectCanRecenter(state),
  currentAggregation: selectAggregation(state),
  isMinAggregation: selectIsMinAggregation(state),
  isMaxAggregation: selectIsMaxAggregation(state),
  orderBookIsEmpty: selectOrderBookIsEmpty(state),
  tradeEnabled: selectTradeEnabled(state),
});

const mapDispatchToProps = {
  incrementAggregation: incrementAggregationAction,
  decrementAggregation: decrementAggregationAction,
  recenterDepth: recenterDepthAction,
};

const OrderBookFooter = ({
  canRecenter,
  currentAggregation,
  decrementAggregation,
  incrementAggregation,
  isMaxAggregation,
  isMinAggregation,
  orderBookIsEmpty,
  recenterDepth,
  tradeEnabled,
}) =>
  orderBookIsEmpty && !tradeEnabled ? null : (
    <div className="order-book-footer">
      {tradeEnabled && <RecenterButton disabled={!canRecenter} onClick={recenterDepth} />}
      <Button.SpaceGroup className="aggregation-buttons">
        <Tooltip
          title={
            isMinAggregation
              ? null
              : t('trader.orderBook.decrementAggregation', {
                  currentAggregation,
                  defaultValue: `Decrease order book level aggregation. Current Aggregation: ${currentAggregation}`,
                })
          }
        >
          <Button
            disabled={isMinAggregation}
            icon="minus"
            size="small"
            onClick={decrementAggregation}
          />
        </Tooltip>
        <Tooltip
          title={
            isMaxAggregation
              ? null
              : t('trader.orderBook.incrementAggregation', {
                  currentAggregation,
                  defaultValue: `Increase order book level aggregation. Current Aggregation: ${currentAggregation}`,
                })
          }
        >
          <Button
            disabled={isMaxAggregation}
            icon="plus"
            size="small"
            onClick={incrementAggregation}
          />
        </Tooltip>
      </Button.SpaceGroup>
    </div>
  );

OrderBookFooter.propTypes = {
  canRecenter: PropTypes.bool.isRequired,
  currentAggregation: PropTypes.number.isRequired,
  decrementAggregation: PropTypes.func.isRequired,
  incrementAggregation: PropTypes.func.isRequired,
  isMaxAggregation: PropTypes.bool.isRequired,
  isMinAggregation: PropTypes.bool.isRequired,
  orderBookIsEmpty: PropTypes.bool.isRequired,
  recenterDepth: PropTypes.func.isRequired,
  tradeEnabled: PropTypes.bool.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(memo(OrderBookFooter));
