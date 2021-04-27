import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { show } from 'redux-modal';

import { selectAccountAlias } from '../../../../common/services/accounts';
import { connectSpinner } from '../../../../common/services/spinner';
import {
  selectIsMfaEnabled,
  selectUserAttributes,
  selectIsSocialUser,
} from '../../../../common/services/user';

import { KYC_FORM_MODAL_ID } from './components/KYCFormModal';
import { apiCallIds, selectProfileIsLoaded, updateProfileAction } from './ducks';
import Account from './components/Account';

const EnhancedAccount = connectSpinner({
  isSaving: apiCallIds.UPDATE_PROFILE,
})(Account);

const mapStateToProps = state => ({
  alias: selectAccountAlias(state),
  userAttributes: selectUserAttributes(state),
  isSocialUser: selectIsSocialUser(state),
  isMfaEnabled: selectIsMfaEnabled(state),
  isFetchingProfile: !selectProfileIsLoaded(state),
});

const mapDispatchToProps = {
  updateProfile: updateProfileAction,
  displayKYCFormModal: () => show(KYC_FORM_MODAL_ID),
};

class AccountContainer extends Component {
  static propTypes = {
//    alias: PropTypes.string.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isMfaEnabled: PropTypes.bool.isRequired,
    isMobile: PropTypes.bool,
    isSocialUser: PropTypes.bool.isRequired,
    updateProfile: PropTypes.func.isRequired,
    userAttributes: PropTypes.object.isRequired,
  };

  render() {
    const {
      alias,
      userAttributes,
      isSocialUser,
      isMfaEnabled,
      isMobile,
      updateProfile,
      isLoading,
      displayKYCFormModal,
    } = this.props;

    return (
      <EnhancedAccount
        alias={alias}
        userAttributes={userAttributes}
        isMobile={isMobile}
        isSocialUser={isSocialUser}
        isMfaEnabled={isMfaEnabled}
        onSubmit={updateProfile}
        isLoading={isLoading}
        displayKYCFormModal={displayKYCFormModal}
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountContainer);
