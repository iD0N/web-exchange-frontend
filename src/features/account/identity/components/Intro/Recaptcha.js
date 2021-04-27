import React from 'react';
import MediaQuery from 'react-responsive';

import Recaptcha from '../../../../../common/components/Recaptcha';

// Forces mounting of new instance when resolution changes,
// because the underlying component does not handle prop update
const EnhancedRecaptcha = props => (
  <>
    <MediaQuery maxWidth="479px">
      {matches => matches && <Recaptcha size="compact" {...props} />}
    </MediaQuery>
    <MediaQuery minWidth="480px">
      {matches => matches && <Recaptcha size="normal" {...props} />}
    </MediaQuery>
  </>
);

export default EnhancedRecaptcha;
