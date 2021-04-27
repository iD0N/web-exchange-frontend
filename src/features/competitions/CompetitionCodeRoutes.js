import React from 'react';
import { Route, Switch } from 'react-router-dom';

import CompeteCodeContainer from './containers/CompeteCodeContainer';

export default () => (
  <Switch>
    <Route path="/compete/:code" component={CompeteCodeContainer} />
  </Switch>
);
