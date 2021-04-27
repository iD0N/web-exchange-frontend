import React, { Component } from 'react';

import { reportError } from '../../common/services/sentry';
import { Container, Row, Col } from '../../common/components';

export default class ErrorBoundary extends Component {
  state = {
    hasError: false,
  };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    reportError(error, errorInfo);
  }

  render() {
    return this.state.hasError ? (
      <Container>
        <Row>
          <Col>
            <h1>Oops</h1>
            <p>
              This is a problem on our side, not yours. Please feel free to report feedback to help
              us resolve this issue promptly.
            </p>
            <h2>
              <a href="/">Back</a>
            </h2>
          </Col>
        </Row>
      </Container>
    ) : (
      this.props.children
    );
  }
}
