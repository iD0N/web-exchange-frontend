import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { OrderEntryProvider } from '../trader/features/order-entry/OrderEntryContext';

import CompetitionContainer from './containers/CompetitionContainer';
import CompeteCodeContainer from './containers/CompeteCodeContainer';
import CompeteContainer from './containers/CompeteContainer';
import LeaderboardContainer from './containers/LeaderboardContainer';

export default () => (
  <div className="competition-screen">
    <OrderEntryProvider>
      <Switch>
        <Route path="/leaderboard" component={LeaderboardContainer} />
        <Route path="/competition/:competitionId" component={CompetitionContainer} />
        <Route path="/competition" render={() => <Redirect to="/settings/competitions" />} />
        <Route path="/compete/:code" component={CompeteCodeContainer} />
        <Route path="/compete" component={CompeteContainer} />
      </Switch>
    </OrderEntryProvider>
  </div>
);
