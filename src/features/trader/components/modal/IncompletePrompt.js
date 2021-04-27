import React, { Component } from 'react';
import { connectModal } from 'redux-modal';
import { Trans } from 'react-i18next';

import { Icon } from '../../../../common/components';
import { ButtonLink, ConfirmationModal } from '../../../../common/components/trader';
import { t } from '../../../../common/services/i18n';
import { KycConsumer } from '../../../account/identity/KycContext';
import { KYC_FAILURE_REASONS } from '../../../account/constants';

export const INCOMPLETE_ACCOUNT_MODAL_ID = 'INCOMPLETE_ACCOUNT_MODAL_ID';

const ConfirmModal = ConfirmationModal(INCOMPLETE_ACCOUNT_MODAL_ID);

class IncompletePrompt extends Component {
  render() {
    const { handleHide, requiresFunds = true } = this.props;

    return (
      <ConfirmModal
        title={
          requiresFunds ? (
            <Trans i18nKey="trader.modal.deposit.title">Next Step: Fund Your Account</Trans>
          ) : (
            <Trans i18nKey="trader.modal.kyc.title">Next Step: Verify Your Identity</Trans>
          )
        }
        message={
          requiresFunds ? (
            <Trans i18nKey="trader.modal.deposit.message">
              You must deposit funds to start trading on Crypto.
            </Trans>
          ) : (
            <KycConsumer>
              {({ isRetryable, failureReason }) => (
                <>
                  {isRetryable && failureReason && (
                    <div className="kyc-retryable-reason">
                      <>
                        <Icon type="warning" />
                      </>
                      <>
                        <strong>{t('fields.identity.failed', { defaultValue: 'Failed' })}: </strong>
                        {KYC_FAILURE_REASONS[failureReason] ||
                          t('kyc.failureReason.unknown', {
                            defaultValue: 'Identity verification has failed. Please retry.',
                          })}
                      </>
                    </div>
                  )}
                  <Trans i18nKey="trader.modal.kyc.message">
                    You must verify your identity to start trading on Crypto.
                  </Trans>
                </>
              )}
            </KycConsumer>
          )
        }
        wrapClassName="trader-modal-prompt"
        customCTA={
          <div>
            <div>
              <ButtonLink
                size="large"
                type="primary"
                to={requiresFunds ? '/settings/transfers' : '/identity'}
              >
                {requiresFunds ? (
                  <Trans i18nKey="trader.modal.deposit.button">Deposit Funds</Trans>
                ) : (
                  <Trans i18nKey="trader.modal.kyc.button">Verify Identity</Trans>
                )}
              </ButtonLink>
            </div>
            <div className="stay-on-page" onClick={handleHide}>
              <Trans i18nKey="trader.modal.optOut">
                No thanks. I would like to stay on this page.
              </Trans>
            </div>
          </div>
        }
      />
    );
  }
}

export default connectModal({ name: INCOMPLETE_ACCOUNT_MODAL_ID })(IncompletePrompt);
