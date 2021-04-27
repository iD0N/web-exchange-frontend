import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import { FontIcon } from '../../';
import { Dropdown, Tooltip } from '../';

const WidgetSettingsDropdown = ({ overlay, t }) => (
  <Dropdown hideIcon overlay={overlay} placement="bottomRight">
    <Tooltip title={t('trader.control.settings', { defaultValue: 'Settings' })}>
      <FontIcon type="menu" />
    </Tooltip>
  </Dropdown>
);

WidgetSettingsDropdown.propTypes = {
  overlay: PropTypes.node.isRequired,
  t: PropTypes.func.isRequired,
};

export default translate()(WidgetSettingsDropdown);
