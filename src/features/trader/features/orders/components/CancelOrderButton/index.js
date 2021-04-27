import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { DeleteIconButton, CloseIconButton } from '../../../../../../common/components/trader';

import { ORDER_STATUS } from '../../constants';

const CancelOrderButton = ({ logCancel, order, orderId, status, onCancel }) => {
  switch (status) {
    case ORDER_STATUS.PENDING:
    case ORDER_STATUS.ACCEPTED:
    case ORDER_STATUS.DONE:
      if (!!orderId) {
        return (
          <DeleteIconButton
            onClick={() => {
              logCancel(order);
              onCancel({ orderId, persistInTable: true });
            }}
            title={<Trans i18nKey="trader.control.cancel">Cancel</Trans>}
          />
        );
      }
      return null;
    case ORDER_STATUS.CANCELED:
    case ORDER_STATUS.REJECTED:
      return (
        <CloseIconButton
          onClick={() => onCancel({ orderId })}
          title={<Trans i18nKey="trader.control.remove">Remove</Trans>}
        />
      );
    case ORDER_STATUS.CANCELLING:
    default:
      return null;
  }
};

CancelOrderButton.propTypes = {
  orderId: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default memo(CancelOrderButton);
