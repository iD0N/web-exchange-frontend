import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connectModal } from 'redux-modal';
import { Trans } from 'react-i18next';

import { Icon } from '../../../../common/components';
import { ConfirmationModal } from '../../../../common/components/trader';

import Chart from '../tradingview/container';
import ContractDetails from '../contract-details';

export const MOBILE_INFO_MODAL = 'mobile/INFO';

const ConfirmModal = ConfirmationModal(MOBILE_INFO_MODAL);

class MobileInfoModal extends Component {
  static propTypes = {
    handleHide: PropTypes.func.isRequired,
  };

  render() {
    return (
      <ConfirmModal
        buttonText={(<Trans i18nKey="nav.trade">Trade</Trans>)}
        hideCancelButton
        isFullscreen
        message={<>
            <div className="trader-mobile-info-modal-chart-wrapper">
              <Chart />
            </div>
            <div className="trader-mobile-info-modal-contract-details-wrapper">
              <ContractDetails />
            </div>
          </>
        }
        wrapClassName="trader-mobile-info-modal"
        onConfirm={() => this.props.handleHide()}
        title={<>
          <Icon type="sliders" />
          <Trans i18nKey="nav.info">Info</Trans>
        </>}
      />
    );
  }
}

export default connectModal({ name: MOBILE_INFO_MODAL })(MobileInfoModal);
