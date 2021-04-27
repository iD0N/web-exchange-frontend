import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import FontIcon from '../../FontIcon';
import Tooltip from '../Tooltip';

const MoveIconButton = ({ t, tooltipVisible }) =>
  tooltipVisible ? (
    <Tooltip title={t('trader.control.move', { defaultValue: 'Move' })}>
      <DragIcon />
    </Tooltip>
  ) : (
    <DragIcon />
  );

MoveIconButton.propTypes = {
  t: PropTypes.func.isRequired,
  tooltipVisible: PropTypes.bool.isRequired,
};

MoveIconButton.defaultProps = {
  tooltipVisible: true,
};

export default memo(translate()(MoveIconButton));

const DragIcon = () => <FontIcon type="drag" style={{ cursor: 'move' }} />;
