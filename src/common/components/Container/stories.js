import React from 'react';
import { storiesOf } from '@storybook/react';

import { Col, Row } from '../';

import Container from './';

const styles = {
  background: 'white',
};

storiesOf('Container', module).add('default', () => (
  <Container>
    <Row>
      <Col style={styles} span={24}>
        Content
      </Col>
    </Row>
  </Container>
));
