import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import { DropTarget } from 'react-dnd';
import cn from 'classnames';

import {
  EVENT_ACTIONS,
  EVENT_TYPES,
} from '../../../../../../../../common/services/eventLogger/constants';
import { ORDER_SIDE, ORDER_TYPE } from '../../../../../../../../common/enums';
import { toQuantityString } from '../../../../../../../../common/utils/numberHelpers';
import { LEVEL_SIDES, LEVEL_SIDE_VERB } from '../../../../utils/constants';
import { getOrderSide } from '../../../../utils';
import {
  ORDER_TYPE_ABBREVIATIONS,
  ORDER_TYPE_ABBREVIATIONS_TFC,
} from '../../../../../../constants';

import { TYPES } from './constants';
import OrderEntrySpread from './OrderEntrySpread';

const getOrderVerb = (orderType, levelSide) =>
  orderType === ORDER_TYPE.STOP_MARKET
    ? LEVEL_SIDE_VERB[levelSide === LEVEL_SIDES.BID ? LEVEL_SIDES.ASK : LEVEL_SIDES.BID]
    : LEVEL_SIDE_VERB[levelSide];

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  sourceItem: monitor.getItem(),
});

const orderEntryTarget = {
  canDrop({ levelSide }, monitor) {
    const { side } = monitor.getItem();

    return levelSide === side || levelSide === LEVEL_SIDES.SPREAD;
  },

  drop({ contractCode, levelPrice, logEvent, onUpdateOrderLevel }, monitor) {
    const { price: currLevelPrice, side, type } = monitor.getItem();

    try {
      logEvent({
        action: EVENT_ACTIONS.MODIFY_ORDERS,
        isMobile: false,
        orderLevel: {
          contractCode,
          side: getOrderSide(type, side),
          price: currLevelPrice,
          newPrice: levelPrice,
          type,
        },
        type: EVENT_TYPES.DRAG_DOM,
        widget: 'order-book',
      });
    } catch (err) {}

    onUpdateOrderLevel({
      type,
      side: getOrderSide(type, side),
      currLevelPrice,
      nextLevelPrice: levelPrice,
    });
  },
};

class OrderEntry extends PureComponent {
  static propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    levelPrice: PropTypes.string.isRequired,
    levelSide: PropTypes.string.isRequired,
    orderQuantity: PropTypes.shape({
      value: PropTypes.number.isRequired,
    }),
    orderType: PropTypes.string.isRequired,
    onUpdateOrderLevel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
  };

  static defaultProps = {
    sourceItem: {},
  };

  state = {
    isHovered: false,
  };

  handleClick = () => {
    const { levelPrice, levelSide, onSubmit, orderType: type } = this.props;

    onSubmit({
      ...(type === ORDER_TYPE.LIMIT
        ? { price: levelPrice, reduceOnly: false }
        : { stopPrice: levelPrice, reduceOnly: true }),
      side: getOrderSide(type, levelSide),
      type,
    });
  };

  handleMouseEnter = () => this.setState({ isHovered: true });

  handleMouseLeave = () => this.setState({ isHovered: false });

  render() {
    const {
      connectDropTarget,
      isOver,
      levelPrice,
      levelSide,
      orderQuantity: { value },
      orderType,
      sourceItem,
      onSubmit,
    } = this.props;
    const { isHovered } = this.state;

    return connectDropTarget(
      <div
        className="order-entry-cell-wrapper"
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        {isOver &&
        !!sourceItem &&
        (levelSide === ORDER_SIDE.SPREAD || levelSide === sourceItem.side) ? (
          <span className="padded-cell-span">
            <Trans i18nKey="trader.orderBook.updatePrice">Update Price</Trans>
          </span>
        ) : (
          isHovered &&
          (levelSide === ORDER_SIDE.SPREAD ? (
            <OrderEntrySpread levelPrice={levelPrice} onSubmit={onSubmit} orderType={orderType} />
          ) : (
            <span
              className={cn('padded-cell-span', 'order-entry-cell', {
                'order-entry-cell-ask': getOrderSide(orderType, levelSide) === ORDER_SIDE.SELL,
                'order-entry-cell-bid': getOrderSide(orderType, levelSide) === ORDER_SIDE.BUY,
                [`order-book-trade-mode-${ORDER_TYPE_ABBREVIATIONS[
                  orderType
                ].toLowerCase()}-${getOrderVerb(orderType, levelSide)}`]: true,
              })}
              onClick={this.handleClick}
            >
              {ORDER_TYPE_ABBREVIATIONS_TFC[orderType]} {getOrderVerb(orderType, levelSide)}{' '}
              {toQuantityString(value)}
            </span>
          ))
        )}
      </div>
    );
  }
}

export default DropTarget(TYPES.ORDER, orderEntryTarget, collect)(OrderEntry);
