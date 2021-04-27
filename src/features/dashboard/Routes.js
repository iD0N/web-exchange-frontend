import React from 'react';
import { Route, Switch } from 'react-router-dom';

import DashboardContainer from './containers/DashboardContainer';

export default () => (
  <div className="competition-screen">
    <Switch>
      <Route path="/summary" component={DashboardContainer} />
    </Switch>
  </div>
);
