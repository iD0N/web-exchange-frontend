import React from 'react';
import { Route, Switch } from 'react-router-dom';
import BodyClassName from 'react-body-classname';
import cn from 'classnames';

import { Layout } from '../../common/components';
import Routes from './CompetitionCodeRoutes';

const CompetitionCodeApp = () => (
  <BodyClassName className={cn('trader-screen', 'settings-screen', 'competition-screen')}>
    <Layout>
      <Switch>
        <Layout.Content>
          <Route path="/compete/:code" component={Routes} />
        </Layout.Content>
      </Switch>
    </Layout>
  </BodyClassName>
);

export default CompetitionCodeApp;
