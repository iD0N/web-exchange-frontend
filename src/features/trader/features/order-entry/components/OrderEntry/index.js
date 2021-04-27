import React from 'react';
import PropTypes from 'prop-types';

import { IsMobile } from '../../../../../../common/components';

import Desktop from './index.desktop';
// import Mobile from './index.mobile';

/*
const OrderEntry = ({ isMobile, ...bag }) =>
  isMobile ? <Mobile {...bag} /> : <Desktop {...bag} />;
*/
const OrderEntry = ({ ...bag }) => <Desktop {...bag} />;

OrderEntry.propTypes = {
  isMobile: PropTypes.bool.isRequired,
};

export default IsMobile(OrderEntry);
