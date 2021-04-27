import React, { createContext } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { selectKycStatus, selectKycFailureReason } from '../../../common/services/user/index';
import {
  selectIsKycNotStarted,
  selectIsKycProcessing,
  selectIsKycProcessingManual,
  selectIsKycPassed,
  selectIsKycFailed,
  selectIsKycRetryable,
} from './ducks';

const KycContext = createContext('kyc');

export const KycConsumer = KycContext.Consumer;

const mapStateToProps = state => ({
  status: selectKycStatus(state),
  isNotStarted: selectIsKycNotStarted(state),
  isProcessing: selectIsKycProcessing(state),
  isProcessingManual: selectIsKycProcessingManual(state),
  isPassed: selectIsKycPassed(state),
  isFailed: selectIsKycFailed(state),
  isRetryable: selectIsKycRetryable(state),
  failureReason: selectKycFailureReason(state),
});

const KycProvider = ({ children, ...bag }) => (
  <KycContext.Provider value={bag}>{children}</KycContext.Provider>
);

KycProvider.propTypes = {
  status: PropTypes.string,
  isNotStarted: PropTypes.bool.isRequired,
  isProcessing: PropTypes.bool.isRequired,
  isPassed: PropTypes.bool.isRequired,
  isFailed: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

export default connect(mapStateToProps)(KycProvider);
