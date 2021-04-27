import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { selectIsMfaEnabled } from '../../../../../../common/services/user';

import SetupMfaContainer from './SetupMfaContainer';
import DisableMfaContainer from './DisableMfaContainer';

const mapStateToProps = state => ({
  isMfaEnabled: selectIsMfaEnabled(state),
});

const MfaContainer = ({ isMfaEnabled }) =>
  isMfaEnabled ? <DisableMfaContainer /> : <SetupMfaContainer />;

MfaContainer.propTypes = {
  isMfaEnabled: PropTypes.bool.isRequired,
};

export default connect(mapStateToProps)(MfaContainer);
