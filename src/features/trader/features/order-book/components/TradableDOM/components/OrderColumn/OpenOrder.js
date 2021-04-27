import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';
import { DragSource, DropTarget } from 'react-dnd';

import {
  EVENT_ACTIONS,
  EVENT_TYPES,
} from '../../../../../../../../common/services/eventLogger/constants';
import { Value, DeleteIconButton } from '../../../../../../../../common/components/trader';
import { getOrderSide } from '../../../../utils/index';
import { selectSizeDecimals } from '../../../../ducks';

import { TYPES } from './constants';

const collectSource = connect => ({
  connectDragSource: connect.dragSource(),
});

const openOrderSource = {
  beginDrag: ({ levelSide, levelPrice, orderType }) => ({
    price: levelPrice,
    side: levelSide,
    type: orderType,
  }),
};

const collectTarget = (connect, monitor) => ({
  canDrop: monitor.canDrop(),
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
});

const openOrderTarget = {
  canDrop({ levelPrice, levelSide }, monitor) {
    const { price, side } = monitor.getItem();

    return levelPrice !== price && levelSide === side;
  },

  drop({ contractCode, levelPrice, logEvent, onUpdateOrderLevel }, monitor) {
    const { type, side, price: currLevelPrice } = monitor.getItem();
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
      currLevelPrice,
      nextLevelPrice: levelPrice,
      side: getOrderSide(type, side),
      type: type,
    });
  },
};

const mapStateToProps = state => ({
  sizeDecimals: selectSizeDecimals(state),
});

class OpenOrder extends PureComponent {
  static propTypes = {
    canDrop: PropTypes.bool.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    levelPrice: PropTypes.string.isRequired,
    levelSide: PropTypes.string.isRequired,
    logEvent: PropTypes.func,
    orderSize: PropTypes.number.isRequired,
    orderType: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
    onUpdateOrderLevel: PropTypes.func.isRequired,
    sizeDecimals: PropTypes.number.isRequired,
  };

  handleCancel = () => {
    const { levelPrice, levelSide, onCancel, orderType: type } = this.props;
    try {
      this.logOrderLevelCancel();
    } catch (err) {}

    onCancel({
      type,
      priceLevel: levelPrice,
      side: getOrderSide(type, levelSide),
    });
  };

  logOrderLevelCancel = () => {
    const { contractCode, levelPrice, levelSide, logEvent, orderType: type } = this.props;

    logEvent({
      action: EVENT_ACTIONS.CANCEL_ORDERS,
      isMobile: false,
      orderLevel: {
        contractCode,
        price: levelPrice,
        side: levelSide,
        type,
      },
      type: EVENT_TYPES.CLICK,
      widget: 'order-book',
    });
  };

  render() {
    const {
      canDrop,
      connectDragSource,
      connectDropTarget,
      isOver,
      orderSize,
      sizeDecimals,
    } = this.props;

    return connectDropTarget(
      <div>
        {isOver && canDrop && <Trans i18nKey="trader.orderBook.updatePrice">Update Price</Trans>}
        {connectDragSource(
          <span className="padded-cell-span">
            <Value.Numeric type="size" decimals={sizeDecimals} value={orderSize} />
            <DeleteIconButton tooltipVisible={false} onClick={this.handleCancel} />
          </span>
        )}
      </div>
    );
  }
}

export default DropTarget(
  TYPES.ORDER,
  openOrderTarget,
  collectTarget
)(DragSource(TYPES.ORDER, openOrderSource, collectSource)(connect(mapStateToProps)(OpenOrder)));
