import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { Icon } from '../../';

import Tooltip from '../Tooltip';

const CloseIconButton = ({ className, t, title, tooltipVisible, onClick }) =>
  tooltipVisible ? (
    <Tooltip
      className={className}
      title={title || t('trader.control.close', { defaultValue: 'Close' })}
    >
      <CloseIcon onClick={onClick} />
    </Tooltip>
  ) : (
    <CloseIcon onClick={onClick} />
  );

CloseIconButton.propTypes = {
  className: PropTypes.string,
  t: PropTypes.func.isRequired,
  title: PropTypes.node,
  tooltipVisible: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

CloseIconButton.defaultProps = {
  tooltipVisible: true,
};

export default memo(translate()(CloseIconButton));

const CloseIcon = ({ onClick }) => (
  <Icon
    type="close"
    onClick={e => {
      e.stopPropagation();
      onClick();
    }}
    style={{ cursor: 'pointer' }}
  />
);

CloseIcon.propTypes = {
  onClick: PropTypes.func.isRequired,
};
