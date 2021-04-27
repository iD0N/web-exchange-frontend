import React from 'react';

import VerifyEmailContainer from './VerifyEmailContainer';

const VerifyMobileContainer = props => (
  <VerifyEmailContainer {...props} isVerifyMobile />
);

export default VerifyMobileContainer;