import React from 'react';

import { CONTRACT_TYPE } from '../../../../../../common/enums';
import { EVENT_TYPES } from '../../../../../../common/services/eventLogger/constants';
import { Button } from '../../../../../../common/components/trader';
import { TradeModeConsumer } from '../../Context';

import OrderTypeRadio from './OrderTypeRadio';
import ManageOrders from './ManageOrders';
import MarketOrderButtons from './MarketOrderButtons';
import QuantitySelector from './QuantitySelector';
import QuantityButtons from './QuantityButtons';
import createConfirmClosePositionModal from './ConfirmClosePositionModal';

export const CLOSE_POSITION_MODAL_ID = 'tradeMode/close-position-modal';

const ConfirmClosePositionModal = createConfirmClosePositionModal(CLOSE_POSITION_MODAL_ID);

const ToolBar = () => (
  <TradeModeConsumer>
    {({
      cancelOrdersInLevel,
      cancelOrdersBySide,
      closePosition,
      contract: { contractCode, quantityStep, minimumQuantity, type, underlying },
      handleOrderQuantityChange,
      handleOrderTypeChange,
      handleSubmitOrder,
      classPrefix,
      isLoggedIn,
      logEvent,
      orderQuantity: { value },
      orderType,
      quantityIsValid,
      showOrderTypeRadio,
      tradeEnabled,
      widget,
    }) =>
      isLoggedIn &&
      tradeEnabled && (
        <>
          <ConfirmClosePositionModal
            closePosition={() => closePosition({ contractCode, widget })}
            contractCode={contractCode}
          />
          <div className="trademode-toolbar">
            <div className="trademode-toolbar-quantity-actions">
              {showOrderTypeRadio && (
                <OrderTypeRadio type={orderType} onChange={handleOrderTypeChange} />
              )}
              <QuantitySelector
                onQuantityChange={handleOrderQuantityChange}
                orderQuantity={value}
                sizeMinimum={minimumQuantity}
                sizeStep={quantityStep}
              />
              <QuantityButtons
                contractCode={contractCode}
                orderQuantity={value}
                onQuantityChange={handleOrderQuantityChange}
              />
            </div>
            <Button.SpaceGroup className="trademode-toolbar-order-actions">
              <MarketOrderButtons
                classPrefix={classPrefix}
                submitOrder={handleSubmitOrder}
                suffix={type === CONTRACT_TYPE.SPOT ? underlying : undefined}
                tradableQuantityIsValid={quantityIsValid}
              />
              <ManageOrders
                cancelOrdersBySide={cancelOrdersBySide}
                contractCode={contractCode}
                classPrefix={classPrefix}
                logEvent={action => {
                  logEvent({
                    action,
                    type: EVENT_TYPES.CLICK,
                    widget,
                    isMobile: false,
                    contractCode,
                  });
                }}
                tradableQuantityIsValid={quantityIsValid}
              />
            </Button.SpaceGroup>
          </div>
        </>
      )
    }
  </TradeModeConsumer>
);

export default ToolBar;
