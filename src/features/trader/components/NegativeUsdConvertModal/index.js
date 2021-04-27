import React from 'react';
import { connectModal } from 'redux-modal';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';

import { ConfirmationModal } from '../../../../common/components/trader';
import { rebalanceUsdAction } from '../../../../common/services/accounts';

export const NEGATIVE_USD_CONVERT_MODAL = 'NEGATIVE_USD_CONVERT_MODAL';

const ConfirmModal = ConfirmationModal(NEGATIVE_USD_CONVERT_MODAL);

const mapDispatchToProps = {
  rebalanceUsd: rebalanceUsdAction.request,
};

const NegativeUsdConvertModal = ({ rebalanceUsd }) => (
  <ConfirmModal
    wrapClassName="trader-modal-prompt trader-modal-prompt-settings"
    title={<Trans i18nKey="trader.modal.convert.title">Convert Negative Balance</Trans>}
    message={
      <>
      <Trans i18nKey="trader.modal.convert.body">Converting your negative USD balance will deduct from your other token balances to bring your USD balance to 0. </Trans>
      <a href='https://www.crypto.io' target="_blank" rel="noopener noreferrer"><Trans i18nKey="trader.modal.convert.learnMore">Click here to learn more.</Trans></a>
      </>
    }
    buttonText={<Trans i18nKey="trader.modal.convert.button">Convert</Trans>}
    onConfirm={rebalanceUsd}
  />
);

export default connectModal({ name: NEGATIVE_USD_CONVERT_MODAL })(
  connect(null, mapDispatchToProps)(NegativeUsdConvertModal)
 );
