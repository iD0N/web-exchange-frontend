import React, { Component } from 'react';
import { connectModal } from 'redux-modal';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';

import { acceptACDXTokenTermsAction } from '../../../../common/services/user';
import { apiCallIds } from '../../../../common/services/user/api';
import { selectIsInProgress } from '../../../../common/services/spinner';
import { Button, Checkbox, ConfirmationModal } from '../../../../common/components/trader';

import { openGlobalContractAction } from '../../data-store/ducks';

export const TOKEN_TERMS_MODAL_ID = 'TOKEN_TERMS_MODAL_ID';

const ConfirmModal = ConfirmationModal(TOKEN_TERMS_MODAL_ID);

const mapStateToprops = state => ({
  isLoading: selectIsInProgress(state, apiCallIds.ACCEPT_ACDX_TOKEN_TERMS),
});

const mapDispatchToProps = {
  setGlobalContract: openGlobalContractAction,
  agreeToTerms: acceptACDXTokenTermsAction,
};

class TokenTermsPrompt extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false,
    };
  }

  componentWillUnmount() {
    if (!this.props.acceptedEmxTokenTerms) {
      this.props.setGlobalContract('BTC-PERP');
    }
  }

  componentDidUpdate({ acceptedEmxTokenTerms: prevAcceptedEmxTokenTerms }) {
    if (prevAcceptedEmxTokenTerms !== this.props.acceptedEmxTokenTerms) {
      this.props.handleHide();
    }
  }

  render() {
    const { agreeToTerms, handleHide, isLoading, isSaftHolder = false } = this.props;
    const { checked } = this.state;

    return (
      <ConfirmModal
        title={
          isSaftHolder ? (
            <Trans i18nKey="trader.modal.tokenTerms.title.saftHolder" />
          ) : (
            <Trans i18nKey="trader.modal.tokenTerms.title.default" />
          )
        }
        loading={isLoading}
        message={
          <div className="token-terms-body">
            {isSaftHolder ? (
              <>
                <div>
                  <Trans i18nKey="trader.modal.tokenTerms.saftHolder.paragraph1" />
                </div>
                <div>
                  <Trans i18nKey="trader.modal.tokenTerms.saftHolder.paragraph2" />
                </div>
                <div>
                  <Trans i18nKey="trader.modal.tokenTerms.saftHolder.paragraph3" />
                </div>
              </>
            ) : (
              <Trans i18nKey="trader.modal.tokenTerms.default.paragraph1" />
            )}
          </div>
        }
        wrapClassName="trader-modal-prompt trader-modal-prompt-token-agreement"
        customCTA={
          <div>
            {!isLoading && (
              <Checkbox checked={checked} onChange={() => this.setState({ checked: !checked })}>
                <Trans i18nKey="trader.modal.tokenTerms.checkbox" />
              </Checkbox>
            )}
            <div className="btn-wrapper">
              <Button block type="default" ghost disabled={isLoading} onClick={handleHide}>
                <Trans i18nKey="trader.control.cancel">Cancel</Trans>
              </Button>
              <Button block type="primary" disabled={!checked || isLoading} onClick={agreeToTerms}>
                <Trans i18nKey="trader.modal.tokenTerms.acceptTerms">Accept Terms</Trans>
              </Button>
            </div>
          </div>
        }
      />
    );
  }
}

export default connectModal({ name: TOKEN_TERMS_MODAL_ID })(
  connect(mapStateToprops, mapDispatchToProps)(TokenTermsPrompt)
);
