import React, { Component } from 'react';
import PropTypes from 'prop-types';
import once from 'lodash.once';
import after from 'lodash.after';
import qs from 'qs';

import { isDevStage } from '../../../../config';
import { Row, Col } from '../../../../common/components';

const CONTAINER_ID = 'jumio_container';

class JumioIframeContainer extends Component {
  componentDidMount() {
    window.addEventListener('message', once(this.handleMessage), false);
  }

  handleMessage = () => {
    const { onCompleted, transactionReference } = this.props;
    const iframe = document.getElementById(CONTAINER_ID);

    iframe.addEventListener(
      'load',
      after(
        2,
        once(event => {
          // write KYC complete event to Google Analytics (query params are passed
          // to redirect in IFRAME by NetVerify) Note: we cannot access
          // contentWindow.location in dev, as the IFRAME is navigated to a
          // different domain, and thus we get a CORS error.

          const waitForContentWindow = () => {
            if (event.target && event.target.contentWindow) {
              const queryStr = isDevStage() ? '' : event.target.contentWindow.location.search;
              const { transactionStatus, errorCode } = qs.parse(queryStr, {
                ignoreQueryPrefix: true,
              });
              return onCompleted({
                jumioTransactionReference: transactionReference,
                jumioTransactionStatus: transactionStatus,
                jumioErrorCode: errorCode,
              });
            }

            setTimeout(waitForContentWindow, 100);
          };

          waitForContentWindow();
        })
      )
    );
  };

  render() {
    const { redirectUrl } = this.props;

    return (
      <Row>
        <Col lg={{ push: 3, span: 18 }}>
          <iframe
            id={CONTAINER_ID}
            title={CONTAINER_ID}
            src={redirectUrl}
            className="jumio-iframe"
            allow="camera"
          />
        </Col>
      </Row>
    );
  }
}

JumioIframeContainer.propTypes = {
  redirectUrl: PropTypes.string.isRequired,
  transactionReference: PropTypes.string.isRequired,
  onCompleted: PropTypes.func.isRequired,
};

export default JumioIframeContainer;
