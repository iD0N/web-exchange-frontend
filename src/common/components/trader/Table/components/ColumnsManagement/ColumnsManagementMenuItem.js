import React from 'react';
import { Trans } from 'react-i18next';

import { FontIcon } from '../../../../';
import { Menu } from '../../../';

const ColumnsManagementMenuItem = props => (
  <Menu.Item {...props}>
    <FontIcon type="settings" style={{ marginRight: 5 }} />
    <Trans i18nKey="trader.columnsManagement.manageColumns">Manage Columns</Trans>
  </Menu.Item>
);

export default ColumnsManagementMenuItem;
