import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'antd/lib/modal';
import cn from 'classnames';

import DisableBodyScroll from '../../DisableBodyScroll';
import IsMobile from '../../IsMobile';

const TraderModal = ({ children, className, fullscreen, isMobile, wrapClassName, ...bag }) => {
  const isFullscreen = fullscreen || isMobile;

  return (
    <Modal
      className={cn(className, { 'trader-modal-fullscreen': isFullscreen })}
      wrapClassName={wrapClassName}
      {...bag}
      {...(isFullscreen
        ? {
            centered: undefined,
            width: undefined,
          }
        : {})}
      prefixCls="trader-modal"
    >
      {isMobile ? (
        children
      ) : (
        <DisableBodyScroll
          elementSelector={() => document.querySelector(`.${wrapClassName} .trader-modal-content`)}
        >
          {children}
        </DisableBodyScroll>
      )}
    </Modal>
  );
};

TraderModal.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  fullscreen: PropTypes.bool,
  isMobile: PropTypes.bool.isRequired,
  wrapClassName: PropTypes.string,
};

export default IsMobile(TraderModal);
