import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { fetchAffiliateAction, selectDepositBonusEligible } from '../../../services/user';
import { selectAccountTraderId } from '../../../services/accounts';

import SystemBannerItem from './SystemBannerItem';

const mapStateToProps = (state, { isLoggedIn }) => ({
  traderIdReady: !!selectAccountTraderId(state),
  depositBonusEligible: selectDepositBonusEligible(state),
});

const mapDispatchToProps = {
  fetchUserData: fetchAffiliateAction.request,
};

class BonusBanner extends Component {
  static propTypes = {
    fetchUserData: PropTypes.func.isRequired,
    isLoggedIn: PropTypes.bool,
    t: PropTypes.func.isRequired,
  };

  componentDidMount() {
    if (this.props.traderIdReady) {
      this.props.fetchUserData();
    }
  }

  componentDidUpdate({ traderIdReady: wasReady }) {
    if (!wasReady && this.props.traderIdReady) {
      this.props.fetchUserData();
    }
  }

  render() {
    const { depositBonusEligible, isLoggedIn, t } = this.props;
    if (isLoggedIn) {
      if (depositBonusEligible) {
        // bonus all spent, has yet to deposit funds for deposit bonus
        return (
          <SystemBannerItem
            messageOverride={`<a href="/settings/transfers">${t('promotions.launch.deposit')}</a>`}
            flagKey="system-message-news"
            type="success"
            icon="bank"
          />
        );
      }
      // default news banner
      return <SystemBannerItem flagKey="system-message-news" type="success" />;
    }

    return null;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(translate()(BonusBanner));
