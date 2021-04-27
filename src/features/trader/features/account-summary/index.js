import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { IsMobile } from '../../../../common/components';
import ChannelSubscription from '../../ws-subscription/containers/ChannelSubscription';
import { WS_CHANNELS } from '../../constants';
import { selectPositionsContracts } from '../positions/ducks';
import { selectBtcContractCode } from '../../data-store/ducks';

import { selectAccountSummaryData } from './ducks';

import AccountSummary from './components/AccountSummary';

const mapStateToProps = state => ({
  accountSummaryData: selectAccountSummaryData(state),
  btcContractCode: selectBtcContractCode(state),
  positionsContracts: selectPositionsContracts(state),
});

const AccountSummaryContainer = ({
  accountSummaryData,
  btcContractCode,
  isMobile,
  positionsContracts,
}) => (
  <ChannelSubscription channel={WS_CHANNELS.BALANCES}>
    <ChannelSubscription channel={WS_CHANNELS.ORDERS}>
      <AccountSummary accountSummaryData={accountSummaryData} isMobile={isMobile} />
    </ChannelSubscription>
  </ChannelSubscription>
);

AccountSummaryContainer.propTypes = {
  accountSummaryData: PropTypes.object.isRequired,
  btcContractCode: PropTypes.string,
  isMobile: PropTypes.bool,
  positionsContracts: PropTypes.array.isRequired,
};

export default connect(mapStateToProps)(IsMobile(AccountSummaryContainer));
