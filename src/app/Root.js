import React from 'react';
import { ConnectedRouter } from 'react-router-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import { connect, Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/es/integration/react';
import { I18nextProvider } from 'react-i18next';
import LocaleProvider from 'antd/lib/locale-provider';
import enUS from 'antd/lib/locale-provider/en_US';
import { CookiesProvider } from 'react-cookie';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import { silentReloginAction } from '../common/services/user';
import LaunchDarklyConfig from '../common/services/launchDarkly/LaunchDarklyConfig';
import Maintenance from '../common/services/launchDarkly/Maintenance';
import UserIdTracking from '../common/services/userIdTracking';
import i18n from '../common/services/i18n';
import IsLoggedInOrElseSignup from '../common/services/user/guards/IsLoggedInOrElseSignup';
import IsLoggedInWithAppAccess from '../common/services/user/guards/IsLoggedInWithAppAccess';
import IsLoggedIn from '../common/services/user/guards/IsLoggedIn';
import HasAppAccess from '../common/services/user/guards/HasAppAccess';
import ShouldNotRedirect from '../common/services/user/guards/ShouldNotRedirect';
import IsNotTestnetAuth from '../common/services/user/guards/IsNotTestnetAuth';
import Connection from '../common/services/webSocket/Connection';
import { selectActivityPeriodKey, selectAppRendered } from '../common/services/webSocket';

import AccountApp from '../features/account/App';
import AuthApp from '../features/auth/App';
import CompetitionCodeApp from '../features/competitions/CompetitionCodeApp';
import SettingsApp from '../features/settings/App';
import TraderApp from '../features/trader/App';

import { store, persistor, history } from './store/configureStore';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

import { OAUTH_SIGNIN_PATH } from '../config';

const mapStateToProps = state => ({
  activityPeriodKey: selectActivityPeriodKey(state),
  appRendered: selectAppRendered(state),
});

const ActivityPeriodTracker = connect(
  mapStateToProps
)(({ activityPeriodKey, appRendered, children }) =>
  appRendered ? <span key={activityPeriodKey}>{children}</span> : null
);

const Root = () => (
  <ErrorBoundary>
    <Provider store={store}>
      <ActivityPeriodTracker>
        <I18nextProvider i18n={i18n}>
          <LocaleProvider locale={enUS}>
            <>
              <PersistGate
                loading={<div />}
                persistor={persistor}
                onBeforeLift={() =>
                  history.location.pathname !== '/auth/logout' &&
                  store.dispatch(silentReloginAction())
                }
              >
                <LaunchDarklyConfig>
                  <CookiesProvider>
                    <Maintenance>
                      {({ hideContents }) =>
                        !hideContents && (
                          <Connection>
                            <DragDropContextProvider backend={HTML5Backend}>
                              <ConnectedRouter history={history}>
                                <ScrollToTop>
                                  <Switch>
                                    <Route
                                      exact
                                      path="/trader/:contractCode?"
                                      component={HasAppAccess(ShouldNotRedirect(TraderApp))}
                                    />
                                    <Route
                                      path="/settings"
                                      component={IsLoggedInWithAppAccess(SettingsApp)}
                                    />
                                    <Route path="/summary" component={SettingsApp} />
                                    <Route path="/fields" component={IsLoggedIn(SettingsApp)} />
                                    <Route
                                      path="/identity"
                                      component={IsLoggedInWithAppAccess(SettingsApp)}
                                    />
                                    <Route
                                      path="/profile"
                                      component={IsLoggedInWithAppAccess(SettingsApp)}
                                    />
                                    <Route path="/leaderboard" component={SettingsApp} />
                                    <Route path="/competition" component={SettingsApp} />
                                    <Route
                                      exact
                                      path="/compete"
                                      component={IsLoggedInOrElseSignup(SettingsApp)}
                                    />
                                    <Route path="/compete/:code" component={CompetitionCodeApp} />
                                    <Redirect
                                      from={`/${OAUTH_SIGNIN_PATH}`}
                                      to="/auth/social-login"
                                    />
                                    <Redirect
                                      from="/sign-up/:referralCode"
                                      to="/auth/sign-up/:referralCode"
                                    />
                                    <Redirect from="/sign-up" to="/auth/sign-up" />
                                    <Route path="/auth" component={IsNotTestnetAuth(AuthApp)} />
                                    <Route path="/" component={AccountApp} />
                                  </Switch>
                                </ScrollToTop>
                              </ConnectedRouter>
                            </DragDropContextProvider>
                          </Connection>
                        )
                      }
                    </Maintenance>
                  </CookiesProvider>
                </LaunchDarklyConfig>
              </PersistGate>
              <UserIdTracking />
            </>
          </LocaleProvider>
        </I18nextProvider>
      </ActivityPeriodTracker>
    </Provider>
  </ErrorBoundary>
);

export default Root;
