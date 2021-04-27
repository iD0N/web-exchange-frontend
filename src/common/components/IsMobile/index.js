import React from 'react';
import MediaQuery from 'react-responsive';

const MOBILE_LAYOUT_MAX_WIDTH = 767;

const IsMobile = WrappedComponent => props => (
  <MediaQuery maxWidth={`${MOBILE_LAYOUT_MAX_WIDTH}px`}>
    {isMobile => <WrappedComponent {...props} isMobile={isMobile} />}
  </MediaQuery>
);

export default IsMobile;
