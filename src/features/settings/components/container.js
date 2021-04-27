import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { isTestnet } from '../../../config';
import { connectSpinner } from '../../../common/services/spinner';
import { Tabs } from '../../../common/components/trader';
import { Col, IsMobile, Row } from '../../../common/components';
import { selectHasFundsTransfer, selectTraderId } from '../../../common/services/user';

import { TABS, TABS_TITLES, TABS_MOBILE, TABS_ROUTES } from '../constants';

import { apiCallIds } from '../api';
import Account from './account';
import Subaccounts from './subaccounts';
import Preferences from './preferences';
import Transfers from './transfers';
import History from './history';
import Api from './api';
import Affiliates from './affiliates';
import Rewards from './rewards';
// import Staking from './staking';
// import Competitions from './competitions';

const { WithTabs } = Tabs;

const EnhancedAccount = connectSpinner({
  isLoading: apiCallIds.ACCOUNT_DATA,
})(Account);

const EnhancedPreferences = connectSpinner({
  isLoading: apiCallIds.PREFERENCES_DATA,
})(Preferences);

const EnhancedTransfers = connectSpinner({
  isLoading: apiCallIds.TRANSFERS_DATA,
})(Transfers);

const EnhancedApi = connectSpinner({
  isLoading: apiCallIds.API_DATA,
})(Api);


const EnhancedAffiliates = connectSpinner({
  isLoading: apiCallIds.AFFILIATES_DATA,
  isLoadingLedger: apiCallIds.HISTORY_DATA,
})(Affiliates);
/*
const EnhancedCompetitions = connectSpinner({
  isLoading: apiCallIds.ACCOUNT_DATA,
})(Competitions);
*/

const mapStateToProps = state => ({
  accountIdReady: !!selectTraderId(state),
  hasFundsTransfer: selectHasFundsTransfer(state),
});

class SettingsContainer extends Component {
  static propTypes = {
    accountIdReady: PropTypes.bool,
    history: PropTypes.object.isRequired,
  };

  componentDidMount() {
    const { history } = this.props;
    const pageKey = this.getPathKey();
    const routes = this.getTabRoutes();

    if (!pageKey || !routes[pageKey]) {
      history.push(routes[TABS.ACCOUNT]);
    }
  }

  componentDidUpdate({
    match: {
      params: { page: prevPage },
    },
  }) {
    const currentPage = this.getPathKey();

    if (prevPage !== currentPage && this.keySetter) {
      this.keySetter(this.getDefaultKey());
    }
  }

  getTabRoutes = () => {
    const tabs = this.getTabs();
    const routes = TABS_ROUTES;
    for (let key in TABS_ROUTES) {
      if (!tabs[key]) {
        delete routes[key];
      }
    }
    return routes;
  };

  getTabs = () => {
    const tabs = { ...TABS };

    if (isTestnet()) {
      delete tabs['TRANSFERS'];
    }

    return tabs;
  };

  handleChange = pageKey => {
    if (this.getDefaultKey().toUpperCase() !== pageKey) {
      this.props.history.push(this.getTabRoutes()[pageKey]);
    }
  };

  getPathKey = () => this.props.match.params.page && this.props.match.params.page.toUpperCase();

  getDefaultKey = () => (this.getPathKey() ? this.getPathKey().toUpperCase() : TABS.ACCOUNT);

  renderSubpage = activeKey => {
    const { isMobile } = this.props;

    switch (activeKey) {
      case TABS.ACCOUNT:
        return <EnhancedAccount isMobile={isMobile} />;
      case TABS.SUBACCOUNTS:
        return <Subaccounts isMobile={isMobile} />;
      case TABS.PREFERENCES:
        return <EnhancedPreferences isMobile={isMobile} />;
      case TABS.TRANSFERS:
        return <EnhancedTransfers isMobile={isMobile} />;
      case TABS.HISTORY:
        return <History isMobile={isMobile} />;
      case TABS.API:
        return <EnhancedApi isMobile={isMobile} />;
      case TABS.AFFILIATES:
       return <EnhancedAffiliates isMobile={isMobile} />;
      case TABS.REWARDS:
        return <Rewards isMobile={isMobile} />;
      //case TABS.STAKING:
      //  return <Staking isMobile={isMobile} />;
      // case TABS.COMPETITIONS:
      //  return <EnhancedCompetitions isMobile={isMobile} />;
      default:
        return null;
    }
  };

  render() {
    return (
      this.props.accountIdReady && (
        <WithTabs
          defaultKey={this.getDefaultKey()}
          tabs={this.getTabs()}
          tabsT={this.props.isMobile ? TABS_MOBILE : TABS_TITLES}
          onKeyChange={this.handleChange}
        >
          {({ activeKey, keySetter }) => {
            this.keySetter = keySetter;
            return (
              <>
                <Tabs />
                <div className="settings-subpage-wrapper" id="settings-subpage-wrapper">
                  <Row>
                    <Col span={24}>{this.renderSubpage(activeKey)}</Col>
                  </Row>
                </div>
              </>
            );
          }}
        </WithTabs>
      )
    );
  }
}

export default withRouter(IsMobile(connect(mapStateToProps)(SettingsContainer)));
