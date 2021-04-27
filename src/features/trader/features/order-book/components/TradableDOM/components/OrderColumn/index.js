import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { TradeModeConsumer } from '../../../../../trade-mode/Context'; // TODO uplift

import OrderEntry from './OrderEntry';
import OpenOrder from './OpenOrder';

const hasOrderInLevel = (sizeByType, orderType) => !!sizeByType[orderType];

export default class OrderColumn extends PureComponent {
  static propTypes = {
    levelPrice: PropTypes.string.isRequired,
    levelSide: PropTypes.string.isRequired,
    sizeByType: PropTypes.object.isRequired,
  };

  render() {
    const { levelPrice, levelSide, sizeByType } = this.props;

    return (
      <TradeModeConsumer>
        {({
          contract: { contractCode },
          orderQuantity,
          handleSubmitOrder: submitOrder,
          cancelOrdersInLevel,
          logEvent,
          updateOrderLevel,
          quantityIsValid,
          orderType,
        }) => (
          <span className="with-bg">
            {(hasOrderInLevel(sizeByType, orderType) ||
              (quantityIsValid && !!Number(levelPrice))) &&
              (hasOrderInLevel(sizeByType, orderType) ? (
                <OpenOrder
                  contractCode={contractCode}
                  levelPrice={levelPrice}
                  levelSide={levelSide}
                  logEvent={logEvent}
                  orderSize={sizeByType[orderType]}
                  orderType={orderType}
                  onUpdateOrderLevel={updateOrderLevel}
                  onCancel={cancelOrdersInLevel}
                />
              ) : (
                <OrderEntry
                  contractCode={contractCode}
                  levelPrice={levelPrice}
                  levelSide={levelSide}
                  logEvent={logEvent}
                  orderQuantity={orderQuantity}
                  orderType={orderType}
                  onUpdateOrderLevel={updateOrderLevel}
                  onSubmit={submitOrder}
                />
              ))}
          </span>
        )}
      </TradeModeConsumer>
    );
  }
}
