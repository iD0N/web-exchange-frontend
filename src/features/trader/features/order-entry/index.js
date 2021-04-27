import React from 'react';

import { connectSpinner } from '../../../../common/services/spinner';
import { WS_CHANNELS } from '../../constants';
import ChannelSubscription from '../../ws-subscription/containers/ChannelSubscription';

import { apiCallIds } from './ducks';
import { OrderEntryConsumer } from './OrderEntryContext';
import OrderEntry from './components/OrderEntry';

const EnhancedOrderEntry = connectSpinner({
  isLoadingConfig: apiCallIds.FETCH_ORDER_ENTRY_WIDGET_CONFIG,
})(OrderEntry);

const OrderEntryContainer = () => (
  <ChannelSubscription channel={WS_CHANNELS.TRADING}>
    <OrderEntryConsumer>
      {({
        globalContract,
        handleClose,
        handleChange,
        handleConfirmationToggle,
        handleSubmit,
        isOpened,
        notional,
        orderType,
        postOnly,
        price,
        reduceOnly,
        setOrderSize,
        setOrderNotionalSize,
        size,
        sizeType,
        stopOrderType,
        stopPrice,
        stopTrigger,
        trailValue,
      }) =>
        isOpened && (
          <EnhancedOrderEntry
            contract={globalContract}
            handleConfirmationToggle={handleConfirmationToggle}
            onChange={handleChange}
            onCloseClick={handleClose}
            onSubmit={handleSubmit}
            notional={notional}
            orderType={orderType}
            postOnly={postOnly}
            price={price}
            reduceOnly={reduceOnly}
            onSizeChange={setOrderSize}
            onNotionalSizeChange={setOrderNotionalSize}
            size={size}
            sizeType={sizeType}
            stopOrderType={stopOrderType}
            stopPrice={stopPrice}
            stopTrigger={stopTrigger}
            trailValue={trailValue}
          />
        )
      }
    </OrderEntryConsumer>
  </ChannelSubscription>
);

export default OrderEntryContainer;
