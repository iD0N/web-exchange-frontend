import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans, translate } from 'react-i18next';
import cn from 'classnames';

import { CONTACT_EMAIL } from '../../../../../../config';
import {
  Button,
  Form,
  Icon,
  Input,
  Row,
  Col,
} from '../../../../../../common/components';
import { KycConsumer } from '../../../../../account/identity/KycContext';
import { KYC_FAILURE_REASONS } from '../../../../../account/constants';

class Identity extends Component {
  getStatus = ({
    isNotStarted,
    isProcessing,
    isProcessingManual,
    isPassed,
    isFailed,
    isRetryable,
    failureReason,
    t,
  }) =>
    isNotStarted
      ? isRetryable
        ? t('fields.identity.failed', { defaultValue: 'Failed' })
        : t('fields.identity.notVerified', { defaultValue: 'Not Verified' })
      : isProcessing
      ? isProcessingManual
        ? t('fields.identity.processing', { defaultValue: 'Processing' })
        : t('fields.identity.processingManual', { defaultValue: 'Under Review' })
      : isPassed
      ? t('fields.identity.passed', { defaultValue: 'Passed' })
      : t('fields.identity.failed', { defaultValue: 'Failed' });

  getFailureReason = ({ failureReason, isRetryable, t }) =>
    isRetryable && (
      <div className="kyc-retryable-reason">
        <>
          <Icon type="warning" />
        </>
        <>
          <strong>{t('fields.identity.failed', { defaultValue: 'Failed' })}: </strong>
          {KYC_FAILURE_REASONS[failureReason] ||
            t('kyc.failureReason.unknown', {
              defaultValue: 'Identity verification has failed. Please retry.',
            })}
        </>
      </div>
    );

  getButtonLink = ({
    isNotStarted,
    isProcessing,
    isPassed,
    isFailed,
    isRetryable,
    failureReason,
    t,
  }) =>
    isNotStarted ? (
      <Button type="link" onClick={this.props.displayKYCFormModal}>
        {isRetryable ? (
          <Trans i18nKey="fields.identity.retry">Retry</Trans>
        ) : (
          <Trans i18nKey="fields.identity.verify">Verify</Trans>
        )}
      </Button>
    ) : isFailed ? (
      <Button type="link">
        <a href={`mailto:${CONTACT_EMAIL}?subject=Identity Verification`}>
          <Trans i18nKey="fields.identity.contactSupport">Contact support</Trans>
        </a>
      </Button>
    ) : null;

  render() {
    const { t } = this.props;

    return (
      <Form>
        <Row className="kyc-input-wrapper">
          <KycConsumer>
            {contextProps => (
              <Col span={24}>
                <Form.Item
                  floating
                  label={<Trans i18nKey="settings.account.fields.kyc">KYC Status</Trans>}
                  className={cn({ 'kyc-input-wrapper-retryable': contextProps.isRetryable })}
                >
                  <div className="kyc-value-wrapper">{this.getStatus({ ...contextProps, t })}</div>
                  <Input disabled suffix={this.getButtonLink({ ...contextProps, t })} />
                </Form.Item>
                {contextProps.isNotStarted && !contextProps.isRetryable && (
                  <>
                    <div>Your current withdrawal limit: 5 BTC per 24 hour</div>
                    <div>Complete KYC for unlimited withdrawal</div>
                  </>
                )}
                {this.getFailureReason({ ...contextProps, t })}
              </Col>
            )}
          </KycConsumer>
        </Row>
      </Form>
    );
  }
}

Identity.Identity = {
  t: PropTypes.func.isRequired,
};

export default translate()(Identity);
