import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Icon from 'antd/lib/icon';

import Tooltip from '../Tooltip';

const EditIconButton = ({ t, title, tooltipVisible, onClick }) =>
  tooltipVisible ? (
    <Tooltip title={title || t('trader.control.Edit', { defaultValue: 'Edit' })}>
      <EditIcon onClick={onClick} />
    </Tooltip>
  ) : (
    <EditIcon onClick={onClick} />
  );

EditIconButton.propTypes = {
  t: PropTypes.func.isRequired,
  title: PropTypes.node,
  tooltipVisible: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

EditIconButton.defaultProps = {
  tooltipVisible: true,
};

export default memo(translate()(EditIconButton));

const EditIcon = ({ onClick }) => (
  <Icon
    type="edit"
    onClick={e => {
      e.stopPropagation();
      onClick();
    }}
    style={{ cursor: 'pointer' }}
  />
);

EditIcon.propTypes = {
  onClick: PropTypes.func.isRequired,
};
