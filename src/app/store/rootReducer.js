import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as modal } from 'redux-modal';

import accounts from '../../common/services/accounts';
import keyValueStore from '../../common/services/keyValueStore';
import launchDarkly from '../../common/services/launchDarkly';
import spinner from '../../common/services/spinner';
import user, { LOGOUT } from '../../common/services/user';
import webSocket from '../../common/services/webSocket';

import apiKeys from '../../features/settings/components/api/ducks';
import auth from '../../features/auth/ducks';
import transfers from '../../features/settings/components/transfers/ducks';
import history from '../../features/settings/components/history/ducks';
import identity from '../../features/account/identity/ducks';
import leaderboard from '../../features/competitions/ducks';
import competitions from '../../features/settings/components/competitions/ducks';
import notificationTray from '../../features/trader/features/notification-tray/ducks';
import orders from '../../features/trader/features/orders/ducks';
import orderBook from '../../features/trader/features/order-book/ducks';
import traderDataStore from '../../features/trader/data-store/ducks';
import positions from '../../features/trader/features/positions/ducks';
import timeAndSales from '../../features/trader/features/time-and-sales/ducks';
import traderWebSocket from '../../features/trader/ws-subscription/ducks';
import dashboard from '../../features/dashboard/ducks';

const rootReducer = combineReducers({
  accounts,
  webSocket,
  user,
  keyValueStore,
  notificationTray,
  launchDarkly,
  auth,
  identity,
  orders,
  orderBook,
  positions,
  timeAndSales,
  apiKeys,
  transfers,
  history,
  leaderboard,
  competitions,
  traderWebSocket,
  traderDataStore,
  dashboard,
  spinner,
  modal,
  router: routerReducer,
});

export default (state, action) => {
  if (action.type === LOGOUT) {
    return rootReducer(undefined, action);
  }

  return rootReducer(state, action);
};
