import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import { connectModal } from 'redux-modal';
import cn from 'classnames';

import { Spin } from '../../';
import { Modal, Button } from '../';

const ConfirmationModal = ({
  title,
  message,
  buttonClass,
  buttonText,
  className,
  customCTA,
  footer,
  hideCTA,
  hideCancelButton,
  hideConfirmButton,
  onConfirm,
  loading,
  show,
  handleHide,
  wrapClassName,
  disableHide,
}) => (
  <Modal
    centered
    footer={hideCTA ? null : !customCTA ? footer || null : customCTA}
    title={title}
    visible={show}
    closable={disableHide ? false : true}
    className={cn('trader-confirmation-modal', className)}
    onCancel={disableHide ? null : handleHide}
    wrapClassName={wrapClassName}
  >
    <Spin spinning={loading}>
      <>
        {message && <div className="confirmation-message">{message}</div>}
        {!hideCTA && !customCTA && (
          <div className="btn-wrapper">
            {!hideCancelButton && (
              <Button
                block
                type={hideConfirmButton ? 'primary' : 'default'}
                ghost={!hideConfirmButton}
                onClick={handleHide}
              >
                <Trans i18nKey="trader.control.cancel">Cancel</Trans>
              </Button>
            )}
            {!hideConfirmButton && (
              <Button
                block
                type="primary"
                className={buttonClass}
                onClick={() => {
                  onConfirm();
                  handleHide();
                }}
              >
                {buttonText}
              </Button>
            )}
          </div>
        )}
      </>
    </Spin>
  </Modal>
);

ConfirmationModal.propTypes = {
  buttonText: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  buttonClass: PropTypes.string,
  className: PropTypes.string,
  footer: PropTypes.node,
  handleHide: PropTypes.func.isRequired,
  hideConfirmButton: PropTypes.bool.isRequired,
  message: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  onConfirm: PropTypes.func,
  show: PropTypes.bool.isRequired,
  title: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  wrapClassName: PropTypes.string,
};

ConfirmationModal.defaultProps = {
  hideConfirmButton: false,
  buttonText: <Trans i18nKey="trader.control.confirm">Confirm</Trans>,
  loading: false,
};

export default modalId => connectModal({ name: modalId })(ConfirmationModal);
