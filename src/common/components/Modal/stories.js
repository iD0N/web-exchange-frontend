import React from 'react';
import PropTypes from 'prop-types';
import { storiesOf } from '@storybook/react';
import { connect } from 'react-redux';
import { show, connectModal, reducer as modal } from 'redux-modal';

import ReduxDecorator from '../../../../.storybook/addons/ReduxDecorator';

import { Modal, Button } from '../';

const MODAL_ID = 'SIMPLE_MODAL';

const ModalWindow = ({ show, handleHide }) => (
  <Modal
    title="Simple Modal"
    visible={show}
    footer={
      <Button type="primary" onClick={handleHide}>
        Hide modal
      </Button>
    }
    onOk={handleHide}
    onCancel={handleHide}
  >
    <p>This is a simple modal.</p>
  </Modal>
);

ModalWindow.propTypes = {
  show: PropTypes.bool.isRequired,
  handleHide: PropTypes.func.isRequired,
};

const ModalContainer = connectModal({ name: MODAL_ID })(ModalWindow);

const Screen = ({ show }) => (
  <div>
    <Button type="primary" onClick={() => show(MODAL_ID)}>
      Open modal
    </Button>
    <ModalContainer />
  </div>
);

const mapDispatchToProps = { show };

const ScreenContainer = connect(undefined, mapDispatchToProps)(Screen);

storiesOf('Modal', module)
  .addDecorator(ReduxDecorator({ modal }))
  .add('Simple', () => <ScreenContainer />);
