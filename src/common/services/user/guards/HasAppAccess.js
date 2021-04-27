import { connectedReduxRedirect } from 'redux-auth-wrapper/history4/redirect';
import { routerActions } from 'react-router-redux';

import { selectHasAppAccess } from '../';

const HasAppAccess = connectedReduxRedirect({
  authenticatedSelector: selectHasAppAccess,
  redirectAction: routerActions.replace,
  redirectPath: '/fields',
  wrapperDisplayName: 'HasAppAccess',
});

export default Component => HasAppAccess(Component);
