import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';

import {
  selectStakingInfo,
  getStakingInfoActions,
  postStakingActions,
  deleteStakingActions,
  setTokenAction,
  selectMaxWithdrawal,
} from '../transfers/ducks';
import { apiCallIds } from '../transfers/api';
import { connectSpinner } from '../../../../common/services/spinner';

import Staking from './component';

const EnhancedStaking = connectSpinner({
  isFetching: apiCallIds.GET_STAKING_INFO,
  isPosting: apiCallIds.POST_STAKING,
  isDeleting: apiCallIds.DELETE_STAKING,
})(Staking);

const mapStateToProps = state => ({
  stakingInfo: selectStakingInfo(state),
  maxWithdrawable: selectMaxWithdrawal(state),
});

const mapDispatchToProps = {
  setToken: setTokenAction,
  getStakingInfo: getStakingInfoActions.request,
  onPostStaking: postStakingActions.request,
  onDeleteStaking: deleteStakingActions.request,
};

class StakingContainer extends Component {
  static propTypes = {
    stakingInfo: PropTypes.object.isRequired,
    getStakingInfo: PropTypes.func.isRequired,
    onPostStaking: PropTypes.func.isRequired,
    onDeleteStaking: PropTypes.func.isRequired,
    isMobile: PropTypes.bool,
  };

  componentWillMount() {
    this.props.setToken('ACDX');
    // sets token for maxWithdrawable selector
  }

  componentWillUnmount() {
    this.props.setToken('BTC');
  }

  render() {
    return (
      <div className="settings-staking-wrapper">
        <h1>
          <Trans i18nKey="settings.staking.title">Crypto Staking</Trans>
        </h1>
        <EnhancedStaking {...this.props} />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StakingContainer);
