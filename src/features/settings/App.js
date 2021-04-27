import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import BodyClassName from 'react-body-classname';
import cn from 'classnames';

import { selectIsLoggedIn } from '../../common/services/user';
import { IsMobile, Layout, NotFound, PageTitle } from '../../common/components';
import HasAppAccess from '../../common/services/user/guards/HasAppAccess';
import IsNotTestnetAuth from '../../common/services/user/guards/IsNotTestnetAuth';
import { MarkNotificationsReadOnUnload } from '../../common/services/notification';
import KycProvider from '../account/identity/KycContext';
import FieldsRoutes from '../account/fields/Routes';
import IdentityRoutes from '../account/identity/Routes';
import DashboardRoutes from '../dashboard/Routes';
import CompetitionRoutes from '../competitions/Routes';

import {
  selectBtcContractCode,
  fetchContractsActions,
  setGlobalContractAction,
  selectGlobalContractCode,
  selectContractCodes,
  selectContractsLoaded,
} from '../trader/data-store/ducks';

import ChannelSubscription from '../trader/ws-subscription/containers/ChannelSubscription';
import { WS_CHANNELS } from '../trader/constants';
import SettingsRoutes from './Routes';

import { Header, Footer } from '../trader/components';

const mapStateToProps = state => ({
  btcContractCode: selectBtcContractCode(state),
  contractCodes: selectContractCodes(state),
  contractsLoaded: selectContractsLoaded(state),
  isLoggedIn: selectIsLoggedIn(state),
  globalContractCode: selectGlobalContractCode(state),
});

const mapDispatchToProps = {
  fetchContracts: fetchContractsActions.request,
  setGlobalContract: setGlobalContractAction,
};

class SettingsApp extends Component {
  static propTypes = {
    contractsLoaded: PropTypes.bool,
    globalContractCode: PropTypes.string,
    setGlobalContract: PropTypes.func.isRequired,
    btcContractCode: PropTypes.string,
    isLoggedIn: PropTypes.bool.isRequired,
    isMobile: PropTypes.bool.isRequired,
    fetchContracts: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const {
      btcContractCode,
      contractsLoaded,
      fetchContracts,
      globalContractCode,
      setGlobalContract,
    } = this.props;
    if (!contractsLoaded) {
      fetchContracts();
    } else if (!globalContractCode) {
      setGlobalContract(btcContractCode);
    }
  }

  componentDidUpdate({ contractsLoaded: prevContractsLoaded }) {
    const { btcContractCode, contractsLoaded, globalContractCode, setGlobalContract } = this.props;

    if (!globalContractCode && !prevContractsLoaded && contractsLoaded) {
      setGlobalContract(btcContractCode);
    }
  }

  render() {
    const { contractCodes, isLoggedIn, isMobile } = this.props;

    return (
      <KycProvider>
        <BodyClassName className={cn('trader-screen', 'settings-screen')}>
          <>
            <PageTitle />
            <MarkNotificationsReadOnUnload />
            <Layout>
              <ChannelSubscription contractCodes={contractCodes || []} channel={WS_CHANNELS.TICKER}>
                <ChannelSubscription channel={WS_CHANNELS.BALANCES}>
                  <>
                    <Header inSettingsApp />
                    <Switch>
                      <Layout.Content>
                        <Route path="/settings" component={SettingsRoutes} />
                        <Route path="/summary" component={DashboardRoutes} />
                        <Route path="/fields" component={IsNotTestnetAuth(FieldsRoutes)} />
                        <Route path="/identity" component={HasAppAccess(IdentityRoutes)} />
                        <Route path="/leaderboard" component={CompetitionRoutes} />
                        <Route path="/competition" component={CompetitionRoutes} />
                        <Route path="/compete" component={CompetitionRoutes} />
                        <Route
                          exact
                          path="/profile"
                          render={() => <Redirect to="/settings/account" />}
                        />
                        <Route
                          exact
                          path="/profile/email"
                          render={() => <Redirect to="/settings/account/email" />}
                        />
                        <Route
                          exact
                          path="/profile/mfa"
                          render={() => <Redirect to="/settings/account/mfa" />}
                        />
                        <Route
                          exact
                          path="/profile/password"
                          render={() => <Redirect to="/settings/account/password" />}
                        />
                      </Layout.Content>
                      <Layout.Content>
                        <Route component={NotFound} />
                      </Layout.Content>
                    </Switch>
                    {!isMobile && <Footer isLoggedIn={isLoggedIn} />}
                  </>
                </ChannelSubscription>
              </ChannelSubscription>
            </Layout>
          </>
        </BodyClassName>
      </KycProvider>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(IsMobile(SettingsApp));
