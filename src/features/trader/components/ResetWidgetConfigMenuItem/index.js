import React from 'react';
import { Trans } from 'react-i18next';

import { Icon } from '../../../../common/components';
import { Menu } from '../../../../common/components/trader';

const ResetWidgetConfigMenuItem = props => (
  <Menu.Item {...props}>
    <Icon type="reload" style={{ marginRight: 5 }} />
    <Trans i18nKey="trader.widget.resetConfig">Reset Widget</Trans>
  </Menu.Item>
);

export default ResetWidgetConfigMenuItem;
