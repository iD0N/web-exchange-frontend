import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { connectSpinner } from '../../../../common/services/spinner';

import {
  apiCallIds,
  selectJumioRedirectUrl,
  selectJumioTransactionReference,
  completeKycAction,
} from '../ducks';
import JumioIframeContainer from './JumioIframeContainer';
import IntroContainer from './IntroContainer';
import Loading from '../components/Loading';

const mapStateToProps = state => ({
  jumioRedirectUrl: selectJumioRedirectUrl(state),
  jumioTransactionReference: selectJumioTransactionReference(state),
});

const mapDispatchToProps = {
  completeKyc: completeKycAction,
};

const IdentityVerificationContainer = ({
  completeKyc,
  jumioRedirectUrl,
  jumioTransactionReference,
  isLoading,
}) =>
  jumioRedirectUrl ? (
    <JumioIframeContainer
      redirectUrl={jumioRedirectUrl}
      transactionReference={jumioTransactionReference}
      onCompleted={completeKyc}
    />
  ) : isLoading ? (
    <Loading />
  ) : (
    <IntroContainer />
  );

IdentityVerificationContainer.propTypes = {
  jumioRedirectUrl: PropTypes.string,
  jumioTransactionReference: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  completeKyc: PropTypes.func.isRequired,
};

export default connectSpinner({
  isLoading: apiCallIds.COMPLETE_KYC,
})(connect(mapStateToProps, mapDispatchToProps)(IdentityVerificationContainer));
