import { connectedReduxRedirect } from 'redux-auth-wrapper/history4/redirect';
import { routerActions } from 'react-router-redux';

import { selectIsMissingVerifiedEmail } from '../ducks';

export default connectedReduxRedirect({
  authenticatedSelector: selectIsMissingVerifiedEmail,
  redirectAction: routerActions.replace,
  redirectPath: '/',
  wrapperDisplayName: 'IsMissingVerifiedEmail',
});
