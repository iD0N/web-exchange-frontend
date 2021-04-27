import { connectedReduxRedirect } from 'redux-auth-wrapper/history4/redirect';
import { routerActions } from 'react-router-redux';

import { selectIsMissingEmail, selectIsMissingAgreements } from '../ducks';

export default connectedReduxRedirect({
  authenticatedSelector: state => selectIsMissingEmail(state) || selectIsMissingAgreements(state),
  redirectAction: routerActions.replace,
  redirectPath: '/fields/verify-email',
  wrapperDisplayName: 'IsMissingAccountField',
});
