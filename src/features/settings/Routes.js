import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { OrderEntryProvider } from '../trader/features/order-entry/OrderEntryContext';

import SettingsContainer from './components/container';
import FieldsContainer from './components/fields';

export default () => (
  <OrderEntryProvider>
    <Switch>
      <Route path="/settings/account/:field" component={FieldsContainer} />
      <Route path="/settings/:page" component={SettingsContainer} />
      <Route path="/settings" render={() => <Redirect to="/settings/account" />} />
    </Switch>
  </OrderEntryProvider>
);
