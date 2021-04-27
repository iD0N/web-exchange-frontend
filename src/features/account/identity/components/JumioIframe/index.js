import React from 'react';
import PropTypes from 'prop-types';

import { Row, Col } from '../../../../../common/components';

const JumioIframe = ({ id, src }) => (
  <Row>
    <Col lg={{ push: 3, span: 18 }}>
      <iframe id={id} title={id} src={src} className="jumio-iframe" allow="camera" />
    </Col>
  </Row>
);

JumioIframe.propTypes = {
  id: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
};

export default JumioIframe;
