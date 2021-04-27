import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import FontIcon from '../../FontIcon';
import Tooltip from '../Tooltip';

const DeleteIconButton = ({ t, title, tooltipVisible, onClick }) =>
  tooltipVisible ? (
    <Tooltip title={title || t('trader.control.delete', { defaultValue: 'Delete' })}>
      <DeleteIcon onClick={onClick} />
    </Tooltip>
  ) : (
    <DeleteIcon onClick={onClick} />
  );

DeleteIconButton.propTypes = {
  t: PropTypes.func.isRequired,
  title: PropTypes.node,
  tooltipVisible: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

DeleteIconButton.defaultProps = {
  tooltipVisible: true,
};

export default memo(translate()(DeleteIconButton));

const DeleteIcon = ({ onClick }) => (
  <FontIcon
    type="delete"
    onClick={e => {
      e.stopPropagation();
      onClick();
    }}
    style={{ cursor: 'pointer' }}
  />
);

DeleteIcon.propTypes = {
  onClick: PropTypes.func.isRequired,
};
