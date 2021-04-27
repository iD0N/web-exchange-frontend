import React from 'react';
import PropTypes from 'prop-types';

import { CONTRACT_TYPE } from '../../../../../../common/enums';

import { TradeModeConsumer } from '../../Context';
import PositionView from './PositionView';
import TradeModeSwitch from './TradeModeSwitch';

const TradeModeToggle = ({ onToggle }) => (
  <TradeModeConsumer>
    {({
      classPrefix,
      isLoggedIn,
      tradeEnabled,
      isInOutage,
      toggleTradeMode,
      contract: { contractCode, type },
      handleOrderQuantityChange,
    }) =>
      isLoggedIn &&
      !isInOutage && (
        <>
          {tradeEnabled && (
            <PositionView
              contractCode={contractCode}
              isSpot={type === CONTRACT_TYPE.SPOT}
              handleOrderQuantityChange={handleOrderQuantityChange}
            />
          )}
          <TradeModeSwitch
            classPrefix={classPrefix}
            tradeEnabled={tradeEnabled}
            toggleTradeMode={toggleTradeMode}
            onToggle={onToggle}
          />
        </>
      )
    }
  </TradeModeConsumer>
);

TradeModeToggle.propTypes = {
  onToggle: PropTypes.func,
};

export default TradeModeToggle;
