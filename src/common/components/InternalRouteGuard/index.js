import React from 'react';
import { withCookies } from 'react-cookie';
import { Redirect } from 'react-router-dom';

import { hasInternalCookie } from '../../../config';

export default WrappedComponent => {
  const InternalRouteGuard = withCookies(({ cookies, allCookies, ...props }) =>
    hasInternalCookie(cookies) ? <WrappedComponent {...props} /> : <Redirect to="/" />
  );

  return () => <InternalRouteGuard />;
};
