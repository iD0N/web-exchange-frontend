import { connectedReduxRedirect } from 'redux-auth-wrapper/history4/redirect';
import { routerActions } from 'react-router-redux';

import { selectHasLoggedInAppAccess } from '../';

const IsLoggedInWithAppAccess = connectedReduxRedirect({
  authenticatedSelector: selectHasLoggedInAppAccess,
  redirectAction: routerActions.replace,
  redirectPath: '/fields',
  wrapperDisplayName: 'LoggedInWithAppAccess',
});

export default Component => IsLoggedInWithAppAccess(Component);
