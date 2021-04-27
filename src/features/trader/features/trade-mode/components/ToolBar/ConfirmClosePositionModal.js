import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';
import BigNumber from 'bignumber.js';

import { ORDER_SIDE } from '../../../../../../common/enums';
import { toQuantityString } from '../../../../../../common/utils/numberHelpers';
import { ConfirmationModal } from '../../../../../../common/components/trader';
import { ZERO_SIZE_STRING } from '../../../../constants';
import { selectPositionQuantity, selectHasOpenPosition } from '../../../positions/ducks'; // TODO uplift

const ConfirmClosePositionModalWrapper = modalId => {
  const ClosePositionModal = ConfirmationModal(modalId);

  const mapStateToProps = (state, { contractCode }) => ({
    positionQuantity: selectPositionQuantity(state, contractCode),
    hasOpenPosition: selectHasOpenPosition(state, contractCode),
  });

  const ConfirmClosePositionModal = ({
    contractCode,
    positionQuantity,
    hasOpenPosition,
    closePosition,
  }) => (
    <ClosePositionModal
      buttonText={<Trans i18nKey="trader.tradeMode.closePosition">Close Position</Trans>}
      hideConfirmButton={!hasOpenPosition}
      message={
        hasOpenPosition ? (
          <Trans
            i18nKey="trader.tradeMode.confirmClosePosition"
            values={{
              size: toQuantityString(
                BigNumber(positionQuantity)
                  .abs()
                  .toNumber()
              ),
              contract: contractCode,
              orderType: BigNumber(positionQuantity).isPositive()
                ? ORDER_SIDE.SELL
                : ORDER_SIDE.BUY,
            }}
          />
        ) : (
          <Trans
            i18nKey="trader.tradeMode.noPosition"
            values={{
              size: toQuantityString(
                BigNumber(positionQuantity)
                  .abs()
                  .toNumber()
              ),
              contract: contractCode,
              orderType: BigNumber(positionQuantity).isPositive()
                ? ORDER_SIDE.SELL
                : ORDER_SIDE.BUY,
            }}
          />
        )
      }
      onConfirm={() => closePosition({ contractCode })}
      title={<Trans i18nKey="trader.tradeMode.closePosition">Close Position</Trans>}
      wrapClassName="confirm-close-position-modal"
    />
  );

  ConfirmClosePositionModal.defaultProps = {
    positionQuantity: ZERO_SIZE_STRING,
  };

  ConfirmClosePositionModal.propTypes = {
    positionQuantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    closePosition: PropTypes.func.isRequired,
    contractCode: PropTypes.string.isRequired,
  };

  return connect(mapStateToProps)(ConfirmClosePositionModal);
};

export default ConfirmClosePositionModalWrapper;
