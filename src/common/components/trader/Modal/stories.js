import React from 'react';
import { storiesOf } from '@storybook/react';
import { connect } from 'react-redux';
import { show, connectModal, reducer as modal } from 'redux-modal';

import ReduxDecorator from '../../../../../.storybook/addons/ReduxDecorator';

import { Modal, Button } from '../';

const MODAL_ID = 'SIMPLE_MODAL';

const ModalWindow = connectModal({ name: MODAL_ID })(({ show, handleHide }) => (
  <Modal
    title="Simple Modal"
    visible={show}
    footer={
      <Button type="primary" onClick={handleHide}>
        Continue
      </Button>
    }
    onOk={handleHide}
    onCancel={handleHide}
  >
    <p>This is a simple modal.</p>
  </Modal>
));

const Demo = ({ show }) => (
  <div>
    <Button type="primary" onClick={() => show(MODAL_ID)}>
      Open modal
    </Button>
    <ModalWindow />
  </div>
);

const DemoContainer = connect(undefined, { show })(Demo);

storiesOf('Trader/Modal', module)
  .addDecorator(ReduxDecorator({ modal }))
  .add('Simple', () => <DemoContainer />);
