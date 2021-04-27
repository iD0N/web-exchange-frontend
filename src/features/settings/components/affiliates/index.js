import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Interpolate, Trans, translate } from 'react-i18next';

import { isTestnet } from '../../../../config';
import { selectAffiliateIncome } from '../../../../common/services/accounts';
import { connectSpinner } from '../../../../common/services/spinner';
import { fetchAffiliateAction, selectAffiliate } from '../../../../common/services/user';
import { apiCallIds } from '../../../../common/services/user/api';

import { Form, Row, Col, Spin } from '../../../../common/components';
import { CopyIconButton, Input, Value } from '../../../../common/components/trader';
import { fetchLedgerActions, selectAffiliateLastDay } from '../history/ducks';

const signUpLinkFromReferral = referralCode =>
  !!referralCode && `https://trade.crypto.io/sign-up/${referralCode.toUpperCase()}`;

const affiliateServicesProgramAgreementUrl =
  'https://support.crypto.io/hc/en-us/articles/360053243874-Terms-of-service';
const affiliateProgramPageUrl = 'https://support.crypto.io/hc/en-us/articles/360053580713-Referral-Program';

const mapStateToProps = state => ({
  affiliate: selectAffiliate(state),
  earnedAffiliate: {
    allTime: selectAffiliateIncome(state),
    lastDay: selectAffiliateLastDay(state),
  },
});

const mapDispatchToProps = {
  fetchAffiliate: fetchAffiliateAction.request,
  fetchLedger: fetchLedgerActions.request,
};

class AffiliatesContainer extends Component {
  static propTypes = {
    affiliate: PropTypes.object,
    earnedAffiliate: PropTypes.object.isRequired,
    fetchAffiliate: PropTypes.func.isRequired,
    isFetchingAffiliate: PropTypes.bool,
    isLoadingLedger: PropTypes.bool,
    isMobile: PropTypes.bool,
  };

  componentDidMount() {
    this.props.fetchAffiliate();
    this.props.fetchLedger();
  }

  render() {
    const {
      affiliate,
      earnedAffiliate,
      isFetchingAffiliate,
      isLoading,
      isLoadingLedger,
      isMobile,
    } = this.props;

    return (
      <Row className="settings-affiliates-wrapper">
        <Col span={isMobile ? 24 : 14}>
          <h1>
            <Trans i18nKey="settings.affiliates.title">Affiliates</Trans>
          </h1>
          {isTestnet() ? (
            <div>
              <Trans i18nKey="settings.affiliates.prodDisclaimer.message">
                Affiliate information is accessible from crypto mainnet.
              </Trans>{' '}
              <a href="https://trade.crypto.io/settings/affiliates">
                <Trans i18nKey="settings.affiliates.prodDisclaimer.action">
                  Click here to access your affiliate information.
                </Trans>
              </a>
            </div>
          ) : (
            <>
              <Col span={24}>
                <div className="affiliate-program-testnet-copy">
                  <Interpolate
                    useDangerouslySetInnerHTML
                    i18nKey="settings.affiliates.info"
                    link={
                      <a href={affiliateProgramPageUrl} target="_blank" rel="noopener noreferrer">
                        <Trans i18nKey="settings.affiliates.clickHere">click here</Trans>
                      </a>
                    }
                  />
                </div>
              </Col>
              <Spin spinning={isFetchingAffiliate || isLoadingLedger || isLoading}>
                {affiliate && (
                  <Col span={24}>
                    <Form.Item
                      colon={false}
                      className="referral-code-input"
                      label={
                        <Trans i18nKey="settings.affiliates.referralCode.label">
                          Referral Link
                        </Trans>
                      }
                    >
                      <Input
                        value={signUpLinkFromReferral(affiliate.referralCode)}
                        spellCheck={false}
                        onClick={e => e.target.select()}
                      />
                      <CopyIconButton
                        content={signUpLinkFromReferral(affiliate.referralCode)}
                        forInput
                      />
                    </Form.Item>
                    <div className="affiliate-count-wrapper">
                      <>
                        <div className="affiliate-count-header">
                          <Trans i18nKey="settings.affiliates.referralCode.header">
                            # of Referred traders
                          </Trans>
                        </div>
                        <div className="affiliate-count-content">
                          {affiliate.referralCount + ' '}
                          <Trans i18nKey="settings.affiliates.referralCode.body">
                            of your friends signed up for crypto using your referral code.
                          </Trans>
                        </div>
                      </>
                      {earnedAffiliate.lastDay !== false && (
                        <>
                          <div className="affiliate-count-header">
                            <Trans i18nKey="settings.affiliates.earned.lastDay">
                              affiliate earned in last 24 hours
                            </Trans>
                          </div>
                          <div className="affiliate-count-content">
                            <Value.Numeric
                              type="token"
                              token={'USD'}
                              decimals={2}
                              value={earnedAffiliate.lastDay}
                            />
                          </div>
                        </>
                      )}
                      <>
                        <div className="affiliate-count-header">
                          <Trans i18nKey="settings.affiliates.earned.allTime">
                            affiliate earned all-time
                          </Trans>
                        </div>
                        <div className="affiliate-count-content">
                          <Value.Numeric
                            type="token"
                            token={'USD'}
                            decimals={2}
                            value={earnedAffiliate.allTime}
                          />
                        </div>
                      </>
                    </div>
                    <div className="affiliate-program-offer">
                      <Interpolate
                        useDangerouslySetInnerHTML
                        i18nKey="settings.affiliates.offer"
                        link={
                          <a
                            href={affiliateProgramPageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Trans i18nKey="settings.affiliates.affiliateProgram">
                              Referral Program
                            </Trans>
                          </a>
                        }
                      />
                    </div>
                    <div className="affiliate-program-disclaimer">
                      <Interpolate
                        useDangerouslySetInnerHTML
                        i18nKey="settings.affiliates.disclaimer"
                        link={
                          <a
                            href={affiliateServicesProgramAgreementUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Referral Program Services Agreement
                          </a>
                        }
                      />
                    </div>
                  </Col>
                )}
              </Spin>
            </>
          )}
        </Col>
      </Row>
    );
  }
}

export default connectSpinner({
  isFetchingAffiliate: apiCallIds.FETCH_USER_AFFILIATE,
})(connect(mapStateToProps, mapDispatchToProps)(translate()(AffiliatesContainer)));
