import { applyMiddleware, createStore, compose } from 'redux';
import { createBrowserHistory } from 'history';
import { createMigrate, persistReducer, persistStore } from 'redux-persist';
import localForage from 'localforage';
import createSagaMiddleware from 'redux-saga';
import { routerMiddleware } from 'react-router-redux';

import config from '../../config';

import silentActions from './silentActions';
import rootReducer from './rootReducer';
import rootSaga from './rootSaga';

import { LOGOUT } from '../../common/services/user';

const history = createBrowserHistory();

const sagaMiddleware = createSagaMiddleware();

const migrations = {
  0: ({ user, ...state }) => state,
};

const persistedReducer = persistReducer(
  {
    key: 'root',
    version: 0,
    storage: localForage,
    whitelist: ['auth', 'user', 'launchDarkly'],
    debug: config().enableDebug,
    migrate: createMigrate(migrations, { debug: config().enableDebug }),
  },
  rootReducer
);

const mobileMessageMiddleware = store => next => action => {
  if (
    window.ReactNativeWebView &&
    window.ReactNativeWebView.postMessage &&
    action.type === LOGOUT
  ) {
    // if in mobile app, don't let the web app logout (the native app will do this), but do clear cached tokens
    if (window.mobileUser) window.mobileUser.clearCachedUser();
    return window.ReactNativeWebView.postMessage(JSON.stringify(action));
  }
  return next(action);
};

const middlewares = [mobileMessageMiddleware, sagaMiddleware, routerMiddleware(history)];

if (config().enableDebug) {
  // redux logging
  const { createLogger } = require('redux-logger');
  middlewares.push(
    createLogger({
      predicate: (getState, action) => !silentActions.includes(action.type),
    })
  );

  // react user timing
  const userTiming = () => next => action => {
    if (performance.mark === undefined) return next(action);
    performance.mark(`${action.type}_start`);
    const result = next(action);
    performance.mark(`${action.type}_end`);
    performance.measure(`${action.type}`, `${action.type}_start`, `${action.type}_end`);
    return result;
  };
  middlewares.push(userTiming);
}

const composeEnhancers =
  // config().enableDebug && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        maxAge: 500,
      })
    : compose;

const store = createStore(persistedReducer, composeEnhancers(applyMiddleware(...middlewares)));
const persistor = persistStore(store);

sagaMiddleware.run(rootSaga);

export { store, persistor, history };
