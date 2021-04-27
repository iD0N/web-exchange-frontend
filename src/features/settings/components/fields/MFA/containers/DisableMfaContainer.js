import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { connectSpinner } from '../../../../../../common/services/spinner';

import { apiCallIds, disableMfaAction } from '../../../account/ducks';
import DisableMfa from '../components/DisableMfa';

const EnhancedDisableMfa = connectSpinner({
  isLoading: apiCallIds.DISABLE_MFA,
})(DisableMfa);

const mapDispatchToProps = {
  disableMfa: disableMfaAction,
};

const DisableMfaContainer = ({ disableMfa }) => <EnhancedDisableMfa onSubmit={disableMfa} />;

DisableMfaContainer.propTypes = {
  disableMfa: PropTypes.func.isRequired,
};

export default connect(undefined, mapDispatchToProps)(DisableMfaContainer);
