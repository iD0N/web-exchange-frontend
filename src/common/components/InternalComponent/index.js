import { withCookies } from 'react-cookie';

import { hasInternalCookie } from '../../../config';

const InternalComponent = ({ cookies, children }) => (hasInternalCookie(cookies) ? children : null);

export default withCookies(InternalComponent);
