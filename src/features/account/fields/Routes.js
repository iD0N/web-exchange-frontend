import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';

import { NotFound } from '../../../common/components';

import IsMissingAccountField from './utils/IsMissingAccountField';
import IsMissingVerifiedEmail from './utils/IsMissingVerifiedEmail';
import CreateAccountContainer from './containers/CreateAccountContainer';
import ChangeEmailContainer from './containers/ChangeEmailContainer';
import VerifyEmailAttributeContainer from './containers/VerifyEmailAttributeContainer';

export default () => (
  <Switch>
    <Route exact path="/fields" render={() => <Redirect to="/fields/account" />} />
    <Route exact path="/fields/account" component={IsMissingAccountField(CreateAccountContainer)} />
    <Route
      exact
      path="/fields/verify-email"
      component={IsMissingVerifiedEmail(VerifyEmailAttributeContainer)}
    />
    <Route exact path="/fields/change-email" component={ChangeEmailContainer} />
    <Route component={NotFound} />
  </Switch>
);
