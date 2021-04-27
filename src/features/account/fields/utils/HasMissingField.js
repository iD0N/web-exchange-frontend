import { connectedReduxRedirect } from 'redux-auth-wrapper/history4/redirect';
import { routerActions } from 'react-router-redux';

import { selectHasMissingFields } from '../ducks';

export default connectedReduxRedirect({
  authenticatedSelector: selectHasMissingFields,
  redirectAction: routerActions.replace,
  redirectPath: '/',
  wrapperDisplayName: 'HasMissingField',
});
