import React from 'react';
import PropTypes from 'prop-types';

import IsLoggedIn from '../../../../../common/services/user/IsLoggedIn';
import { GridLayout } from '../../../components';

import { layouts } from '../../widgetConfigs';
import { GRID_LAYOUT_COLS, GRID_LAYOUT_ROW_HEIGHT } from '../../constants';

const LayoutManager = ({ children, isLoggedIn }) => (
  <GridLayout
    cols={GRID_LAYOUT_COLS}
    layout={isLoggedIn ? layouts.MOBILE.config : layouts.MOBILE_LOGGED_OUT.config}
    rowHeight={GRID_LAYOUT_ROW_HEIGHT}
  >
    {children}
  </GridLayout>
);

LayoutManager.propTypes = {
  children: PropTypes.object.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
};

export default IsLoggedIn(LayoutManager);
