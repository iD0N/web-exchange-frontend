import { connectedReduxRedirect } from 'redux-auth-wrapper/history4/redirect';
import localStorage from 'localStorage';

import { BETA, isProd, PROD, selectRootUrl } from '../../../../config';

const ShouldNotRedirect = connectedReduxRedirect({
  authenticatedSelector: () => {
    if (isProd()) {
      try {
        const redir = localStorage.getItem('redirectPathname');
        if (isProd() && !!redir) {
          return false;
        }
        const shouldRedirect = localStorage.getItem('redirectToTestnet');
        if (!!shouldRedirect) {
          localStorage.removeItem('redirectToTestnet');
          if (!Number.isNaN(shouldRedirect) && Date.now() - Number(shouldRedirect) < 1000 * 60) {
            return false;
          }
        }
      } catch (err) {}
    }
    return true;
  },
  redirectAction: () => {
    let pathname = window.location.pathname;
    let env = BETA;
    try {
      const redir = localStorage.getItem('redirectPathname');
      if (isProd() && !!redir) {
        pathname = redir;
        env = PROD;
        localStorage.removeItem('redirectPathname');
      }
    } catch (err) {}
    window.location.href = `${selectRootUrl(env)}${pathname}`;
    return { type: '', payload: { method: '', args: '' } };
  },
  redirectPath: window.location.pathname,
  wrapperDisplayName: 'isNotTestnetAuth',
});

export default Component => ShouldNotRedirect(Component);
