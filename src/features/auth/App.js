import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import BodyClassName from 'react-body-classname';

import { Layout, NotFound, Footer } from '../../common/components';
import { selectIsLoggedIn } from '../../common/services/user';
import { history } from '../../app/store/configureStore';

import IsAnonymous from './utils/IsAnonymous';
import LoginWrapper from './utils/LoginWrapper';
import RedirectSpinner from './utils/RedirectSpinner';
import AuthContainer from './containers/AuthContainer';
import ForgottenPasswordContainer from './containers/ForgottenPasswordContainer';
import LoginContainer from './containers/LoginContainer';
import ConfirmLoginContainer from './containers/ConfirmLoginContainer';
import LogoutContainer from './containers/LogoutContainer';
import ResetPasswordContainer from './containers/ResetPasswordContainer';
import ResetPasswordMobileContainer from './containers/ResetPasswordMobileContainer';
import SignUpContainer from './containers/SignUpContainer';
import VerifyEmailContainer from './containers/VerifyEmailContainer';
import VerifyMobileContainer from './containers/VerifyMobileContainer';
import Header from './components/Header';

import { withFeatureFlag } from './utils/FeatureFlagHoc';

const mapStateToProps = state => ({
  isLoggedIn: selectIsLoggedIn(state),
});

const AuthApp = ({ isLoggedIn }) =>
  history.location.pathname === '/auth/logout' && !!window.ReactNativeWebView ? (
    <Switch>
      <Route exact path="/auth/logout" component={LogoutContainer} />
    </Switch>
  ) : (
    <BodyClassName className="auth-screen">
      <Layout>
        <Header />
        <Layout.Content>
          <Switch>
            <Route exact path="/auth" render={() => <Redirect to="/auth/login" />} />
              <Route exact path="/auth/login" component={withFeatureFlag(LoginWrapper(LoginContainer), "ip-whitelist")} />
            <Route
              exact
              path="/auth/confirm-login"
                component={withFeatureFlag(LoginWrapper(ConfirmLoginContainer), "ip-whitelist")}
            />
            <Route exact path="/auth/logout" component={RedirectSpinner(LogoutContainer)} />
            <Route
              exact
              path="/auth/sign-up/:referralCode?"
                component={withFeatureFlag(IsAnonymous(SignUpContainer), "ip-whitelist")}
            />
            <Route exact path="/auth/verify-email" component={IsAnonymous(VerifyEmailContainer)} />
            <Route exact path="/auth/verify-mobile" component={IsAnonymous(VerifyMobileContainer)} />
            <Route
              exact
              path="/auth/forgotten-password"
              component={IsAnonymous(ForgottenPasswordContainer)}
            />
            <Route
              exact
              path="/auth/reset-password"
              component={IsAnonymous(ResetPasswordContainer)}
            />
            <Route
              exact
              path="/auth/reset-password-mobile"
              component={IsAnonymous(ResetPasswordMobileContainer)}
            />
            <Route exact path="/auth/social-login" component={LoginWrapper(AuthContainer)} />
            <Route component={NotFound} />
          </Switch>
        </Layout.Content>
        <Footer isLoggedIn={isLoggedIn} />
      </Layout>
    </BodyClassName>
  );

AuthApp.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
};

export default connect(mapStateToProps)(AuthApp);
