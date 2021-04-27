import { connectedReduxRedirect } from 'redux-auth-wrapper/history4/redirect';
import { routerActions } from 'react-router-redux';

import { selectIsKycNotStarted } from '../ducks';

const KycNotStarted = connectedReduxRedirect({
  authenticatedSelector: selectIsKycNotStarted,
  redirectAction: routerActions.replace,
  redirectPath: '/settings/account',
  wrapperDisplayName: 'KycNotStarted',
});

export default KycNotStarted;
