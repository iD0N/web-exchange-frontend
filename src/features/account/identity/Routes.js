import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { NotFound } from '../../../common/components';

import IdentityVerificationContainer from './containers/IdentityVerificationContainer';
import KycNotStarted from './utils/KycNotStarted';

export default () => (
  <Switch>
    <Route exact path="/identity" component={KycNotStarted(IdentityVerificationContainer)} />
    <Route component={NotFound} />
  </Switch>
);
