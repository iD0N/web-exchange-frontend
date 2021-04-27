import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';
import { show } from 'redux-modal';

import { EditIconButton } from '../../../../../../common/components/trader';

import { MODIFY_ORDER_MODAL_ID, ORDER_STATUS } from '../../constants';

const mapDispatchToProps = {
  openModal: order => show(MODIFY_ORDER_MODAL_ID, { order }),
};

const ModifyOrderButton = ({ logModifyInitiate, order, openModal }) =>
  (order.status === ORDER_STATUS.ACCEPTED ||
    (order.status === ORDER_STATUS.PENDING && !!order.orderId)) && (
    <EditIconButton
      title={<Trans i18nKey="trader.orders.modify">Modify</Trans>}
      onClick={() => {
        logModifyInitiate(order);
        openModal(order);
      }}
    />
  );

ModifyOrderButton.propTypes = {
  order: PropTypes.object.isRequired,
  openModal: PropTypes.func.isRequired,
};

export default memo(connect(undefined, mapDispatchToProps)(ModifyOrderButton));
