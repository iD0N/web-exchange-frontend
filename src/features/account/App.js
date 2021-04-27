import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect, Switch, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import BodyClassName from 'react-body-classname';

import { selectIsLoggedIn } from '../../common/services/user';
import { Layout, Footer, NotFound } from '../../common/components';

import KycProvider from './identity/KycContext';

import Header from './components/Header';

const mapStateToProps = (state, { location }) => ({
  isLoggedIn: selectIsLoggedIn(state),
  isIdentity: location.pathname.includes('/identity'),
});

const AccountApp = ({ isIdentity, isLoggedIn }) => (
  <BodyClassName className="account-app-screen">
    <KycProvider>
      <Layout>
        <Header isIdentity={isIdentity} />
        <Switch>
          <Route exact path="/" render={() => <Redirect to="/trader" />} />
          <Route exact path="/home" render={() => <Redirect to="/trader" />} />
          <Layout.Content>
            <Route component={NotFound} />
          </Layout.Content>
        </Switch>
        <Footer isLoggedIn={isLoggedIn} />
      </Layout>
    </KycProvider>
  </BodyClassName>
);

AccountApp.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isIdentity: PropTypes.bool.isRequired,
};

export default withRouter(connect(mapStateToProps)(AccountApp));
