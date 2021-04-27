import { connectedReduxRedirect } from 'redux-auth-wrapper/history4/redirect';
import localStorage from 'localStorage';
import Cookies from 'universal-cookie';
import moment from 'moment';

import { logoutOnStorageChange } from '../';
import { cookieDomainOption, isProd, isTestnet, PROD, selectRootUrl } from '../../../../config';

const cookies = new Cookies();

const IsNotTestnetAuth = connectedReduxRedirect({
  authenticatedSelector: () => {
    if (isProd()) {
      if (window.location.pathname.match('login') || window.location.pathname.match('sign-up')) {
        if (cookies.get('redirectToTestnet', { path: '/', ...cookieDomainOption() }) === 'true') {
          cookies.remove('redirectToTestnet', { path: '/', ...cookieDomainOption() });
          localStorage.setItem('redirectToTestnet', Date.now());
        }
      }
    }
    return !!window.location.pathname.match('logout') || !isTestnet();
  },
  redirectAction: () => {
    cookies.set('redirectToTestnet', 'true', {
      expires: moment()
        .add(1, 'minutes')
        .toDate(),
      ...cookieDomainOption(),
      path: '/',
    });
    try {
      if (window.location.pathname.match('logout')) {
        window.removeEventListener(logoutOnStorageChange);
        localStorage.setItem('logout-event', `logout-${Date.now()}`);
      }
    } catch (err) {}
    window.location.href = `${selectRootUrl(PROD)}${window.location.pathname}`;
    return { type: '', payload: { method: '', args: '' } };
  },
  redirectPath: `${selectRootUrl(PROD)}${window.location.pathname}`,
  wrapperDisplayName: 'isNotTestnetAuth',
});

export default Component => IsNotTestnetAuth(Component);
