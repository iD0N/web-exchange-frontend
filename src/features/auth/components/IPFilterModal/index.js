import React, { Component } from 'react';
import { connectModal } from 'redux-modal';
import { withRouter } from 'react-router-dom';
import { Trans, translate } from 'react-i18next';
import { connect } from 'react-redux';
import { ConfirmationModal } from '../../../../common/components/trader';

const mapStateToprops = state => ({
});

const mapDispatchToProps = {

};
export const IP_FILTER_MODAL_ID = 'IP_FILTER_MODAL_ID';
const ConfirmModal = ConfirmationModal(IP_FILTER_MODAL_ID);


class IPFilterModal extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  componentDidMount() {

  }

  render() {
    return (
      <ConfirmModal
        hideCancelButton={true}
        disableHide={true}
        wrapClassName="trader-modal-prompt trader-modal-prompt-settings"
        title={<Trans i18nKey="ipFilter.title">Unable to provide our service</Trans>}
        message={
          <>
            <Trans i18nKey="ipFilter.message">Apologies. According to your IP address, you seem to be located at a country/region/territory where we currently do not provide service. If you are not a citizen of the country/region/territory where your current IP address is located, please go ahead and conduct the KYC verification</Trans>
          </>
        }
        buttonText={<Trans i18nKey="ipFilter.buttonText">Okay</Trans>}
        onConfirm={() => { 
          this.props.history.push('/trader')
        }}
      />
    )
  }

}

export default withRouter(connectModal({ name: IP_FILTER_MODAL_ID})(
  connect(mapStateToprops, mapDispatchToProps)(translate()(IPFilterModal))
))
