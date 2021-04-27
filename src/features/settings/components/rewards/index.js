import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
//import { Interpolate, Trans, translate } from 'react-i18next';
import { Trans, translate } from 'react-i18next';
import BigNumber from 'bignumber.js';

import { WS_CHANNELS } from '../../../../common/services/webSocket/constants';
import { selectTokenBalances } from '../../../../common/services/accounts';
import { selectRewardsParsed } from '../../../../common/services/user';
import ChannelSubscription from '../../../trader/ws-subscription/containers/ChannelSubscription';
import { selectCollateralPrices, selectContractByCode } from '../../../trader/data-store/ducks';

import { Form, Row, Col, Icon, Spin } from '../../../../common/components';
import { Progress, Tooltip, Value } from '../../../../common/components/trader';

/*
const promosAndOffersPageUrl = 'https://promotions.crypto.io/';
const feesAndRebatesPageUrl =
  'https://support.crypto.io/hc/en-us/articles/360021905954-crypto-Fees-and-Rebates';

const rewardTypeToTooltipKey = {
  fee_discount: 'settings.rewards.feeDiscount.tooltip',
  affiliate_payout: 'settings.rewards.affiliatePayout.tooltip',
};

const rewardTypeToLabelKey = {
  fee_discount: 'settings.rewards.feeDiscount.title',
  deposit_match_usd: 'settings.rewards.depositMatchUSD.title',
  affiliate_payout: 'settings.rewards.affiliatePayout.title',
};
*/

const mapStateToProps = state => {
  const tokenBalances = selectTokenBalances(state);
  const rewards = selectRewardsParsed(state);
  const acdxPrice = selectCollateralPrices(state)['ACDX'];
  const btcContract = selectContractByCode(state, 'BTC-PERP');

  if (rewards.loaded && acdxPrice && tokenBalances) {
    rewards.acdx.amount = BigNumber(tokenBalances.acdx)
      .multipliedBy(acdxPrice)
      .toNumber();
  }

  return {
    tokenBalances: {
      fee: BigNumber(tokenBalances && tokenBalances.fee ? tokenBalances.fee : 0),
      bonusbtc: BigNumber(tokenBalances && tokenBalances.bonusbtc ? tokenBalances.bonusbtc : 0),
    },
    rewards,
    btcContract,
  };
};

const renderFees = ({ makerFee, takerFee }) => (
  <div className="fee-wrapper">
    <h3>
      <Trans i18nKey="settings.rewards.fees.title">Fees</Trans>
    </h3>
    <h4>
      <Trans i18nKey="settings.rewards.fees.maker">Maker Fee</Trans>
    </h4>
    <div className="fee-value">
      <Value.Numeric decimals={3} type="percentage" value={makerFee} />
    </div>
    <h4>
      <Trans i18nKey="settings.rewards.fees.taker">Taker Fee</Trans>
    </h4>
    <div className="fee-value">
      <Value.Numeric decimals={3} type="percentage" value={takerFee} />
    </div>
    <Trans i18nKey="settings.rewards.fees.description">
      The above maker-taker fees are applied across all contracts at Crypto.
    </Trans>
  </div>
);

class RewardsContainer extends Component {
  static propTypes = {
    isMobile: PropTypes.bool,
    tokenBalances: PropTypes.object.isRequired,
    rewards: PropTypes.object.isRequired,
  };

  render() {
    //const { isMobile, tokenBalances, rewards } = this.props;
    const { btcContract, isMobile, rewards } = this.props;

    /*
    const hasMiscRewards =
      rewards.loaded &&
      (rewards.rewards.length !== 0 ||
        !tokenBalances.fee.isZero() ||
        !tokenBalances.bonusbtc.isZero());
    */

    return (
      <ChannelSubscription channel={WS_CHANNELS.ACCOUNT}>
        <Spin spinning={!rewards.loaded}>
          <Row className="settings-rewards-wrapper">
            <Col span={isMobile ? 24 : 8}>
              <Form>
                {rewards.loaded && (
                  <Row>
                    <Col span={24}>
                      <h2>
                        <>
                          <Trans i18nKey="settings.rewards.volume.title">Volume</Trans>
                          {/*`${rewards.volume.tier ? rewards.volume.tier.toString() : ''} `*/}
                        </>
                        {/*<a href={feesAndRebatesPageUrl} target="_blank" rel="noopener noreferrer">
                          <Tooltip
                            title={
                              <>
                                <div key="tooltip">
                                  <Trans i18nKey="settings.rewards.volume.tierTooltip">
                                    Volume tiers unlock lower fees across all contracts. See the
                                    "Crypto Fees and Rebates" page for details. Any additional fee
                                    discounts earned below are applied on top of active volume tier
                                    rewards.
                                  </Trans>
                                </div>
                                {rewards.volume.activeRewards.map(({ type, value }, index) => (
                                  <div key={index}>
                                    {type.replace(/_/g, ' ').toUpperCase()}:{' '}
                                    {BigNumber(value).isGreaterThan(1) ? (
                                      <Value.Numeric type="currency" prefix="$" value={value} />
                                    ) : (
                                      <Value.Numeric type="percentage" value={value} />
                                    )}
                                  </div>
                                ))}
                              </>
                            }
                          >
                            <Icon type="info-circle" />
                          </Tooltip>
                        </a>*/}
                      </h2>
                      <Form.Item
                        id="volume"
                        floating
                        label={
                          <Trans i18nKey="settings.rewards.volume.label">
                            Trailing 30-Day Volume
                          </Trans>
                        }
                      >
                        <div className="space-between">
                          <span className="ant-form-text">
                            <Value.Numeric
                              type="currency"
                              prefix="$"
                              value={rewards.volume.amount}
                            />
                            <Tooltip
                              title={
                                <Trans i18nKey="settings.rewards.volume.tooltip">
                                  Volume and tier are updated every 5 minutes.
                                </Trans>
                              }
                            >
                              <Icon type="info-circle" />
                            </Tooltip>
                          </span>
                        </div>
                      </Form.Item>
                      {rewards.volume.nextTierRequirement && (
                        <div className="progress-wrapper">
                          <Progress
                            showInfo={false}
                            size="small"
                            percent={BigNumber(rewards.volume.amount)
                              .dividedBy(rewards.volume.nextTierRequirement)
                              .multipliedBy(100)
                              .dp(0)
                              .toNumber()}
                          />
                          {/*<div className="progress-info">
                            <Trans i18nKey="settings.rewards.nextTier">Next tier: </Trans>
                            <Value.Numeric
                              type="currency"
                              prefix="$"
                              value={rewards.volume.nextTierRequirement}
                            />
                          </div>*/}
                        </div>
                      )}
                    </Col>
                  </Row>
                )}
                {/*<>
                  {rewards.loaded && BigNumber(rewards.acdx.amount).isFinite() && (
                    <Row>
                      <Col span={24}>
                        <h2>
                          <>
                            <Trans i18nKey="settings.rewards.acdx.tier">Cryoto Tier </Trans>
                            {rewards.acdx.tier ? rewards.acdx.tier.toString() : null}{' '}
                          </>
                          {rewards.acdx.activeRewards.length !== 0 && (
                            <a href={feesAndRebatesPageUrl} target="_blank" rel="noopener noreferrer">
                              <Tooltip
                                title={
                                  <>
                                    {rewards.acdx.activeRewards.map(({ type, value }, index) => (
                                      <div key={index}>
                                        <span className="capitalized">{type.replace(/_/g, ' ')}</span>
                                        :{' '}
                                        {BigNumber(value).isGreaterThan(1) ? (
                                          <Value.Numeric type="currency" prefix="$" value={value} />
                                        ) : (
                                          <Value.Numeric type="percentage" value={value} />
                                        )}
                                      </div>
                                    ))}
                                  </>
                                }
                              >
                                <Icon type="info-circle" />
                              </Tooltip>
                            </a>
                          )}
                        </h2>
                        <Form.Item
                          id="acdx"
                          floating
                          label={<Trans i18nKey="settings.rewards.acdx.label">Crypto Balance</Trans>}
                        >
                          <div className="space-between">
                            <span className="ant-form-text">
                              <Value.Numeric type="currency" prefix="$" value={rewards.acdx.amount} />
                            </span>
                          </div>
                        </Form.Item>
                        {rewards.acdx.nextTierRequirement && (
                          <div className="progress-wrapper">
                            <Progress
                              showInfo={false}
                              size="small"
                              percent={BigNumber(rewards.acdx.amount)
                                .dividedBy(rewards.acdx.nextTierRequirement)
                                .multipliedBy(100)
                                .dp(0)
                                .toNumber()}
                            />
                            <div className="progress-info">
                              <Trans i18nKey="settings.rewards.nextTier">Next tier: </Trans>
                              <Value.Numeric
                                type="currency"
                                prefix="$"
                                value={rewards.acdx.nextTierRequirement}
                              />
                            </div>
                          </div>
                        )}
                      </Col>
                    </Row>
                  )}
                  {hasMiscRewards && (
                    <>
                      <Row>
                        <Col span={24}>
                          <h2>
                            <Trans i18nKey="settings.rewards.active">Active Rewards & Offers</Trans>
                          </h2>
                        </Col>
                      </Row>
                      {rewards.rewards.map(({ expiresAt, type, value }, index) => (
                        <Row key={index}>
                          <Col span={24}>
                            <Form.Item
                              id={type}
                              floating
                              label={
                                rewardTypeToLabelKey[type] ? (
                                  <Trans i18nKey={rewardTypeToLabelKey[type]} />
                                ) : (
                                  type.replace(/_/g, ' ').toUpperCase()
                                )
                              }
                            >
                              <div className="space-between">
                                <span className="ant-form-text">
                                  {BigNumber(value).isGreaterThan(1) ? (
                                    <Value.Numeric type="currency" prefix="$" value={value} />
                                  ) : (
                                    <Value.Numeric type="percentage" value={value} />
                                  )}
                                  {(!!expiresAt || rewardTypeToTooltipKey[type]) && (
                                    <Tooltip
                                      title={
                                        <>
                                          {rewardTypeToTooltipKey[type] && (
                                            <Trans i18nKey={rewardTypeToTooltipKey[type]} />
                                          )}
                                          {!!expiresAt && (
                                            <>
                                              {' '}
                                              <Trans i18nKey="trader.contract.expires">
                                                Expires{' '}
                                              </Trans>{' '}
                                              <Value.Date type="datetime" value={expiresAt} />
                                            </>
                                          )}
                                        </>
                                      }
                                    >
                                      <Icon type="info-circle" />
                                    </Tooltip>
                                  )}
                                </span>
                              </div>
                            </Form.Item>
                          </Col>
                        </Row>
                      ))}
                      {!!tokenBalances && (
                        <>
                          {!tokenBalances.bonusbtc.isZero() && (
                            <Row>
                              <Col span={24}>
                                <Form.Item
                                  id="tradingBonus"
                                  floating
                                  label={
                                    <Trans i18nKey="settings.rewards.tradingBonus.label">
                                      Trading Bonus
                                    </Trans>
                                  }
                                >
                                  <div className="space-between">
                                    <span className="ant-form-text">
                                      <Value.Numeric
                                        type="size"
                                        decimals={8}
                                        value={tokenBalances.bonusbtc.toNumber()}
                                      />
                                      {' BTC'}

                                      <Tooltip
                                        title={
                                          <Trans i18nKey="settings.rewards.tradingBonus.tooltip">
                                            This is a bonus you have earned that may be applied
                                            towards fees, funding payments, and realized losses. It
                                            may not be withdrawn.
                                          </Trans>
                                        }
                                      >
                                        <Icon type="info-circle" />
                                      </Tooltip>
                                    </span>
                                  </div>
                                </Form.Item>
                              </Col>
                            </Row>
                          )}
                          {!tokenBalances.fee.isZero() && (
                            <Row>
                              <Col span={24}>
                                <Form.Item
                                  id="feeCredits"
                                  floating
                                  label={
                                    <Trans i18nKey="settings.rewards.feeCredits.label">
                                      Trading Fee Credits
                                    </Trans>
                                  }
                                >
                                  <div className="space-between">
                                    <span className="ant-form-text">
                                      <Value.Numeric
                                        type="currency"
                                        prefix="$"
                                        value={tokenBalances.fee.toNumber()}
                                      />

                                      <Tooltip
                                        title={
                                          <Trans i18nKey="settings.rewards.feeCredits.tooltip">
                                            This is a credit you have earned that may be applied
                                            toward trading fees.
                                          </Trans>
                                        }
                                      >
                                        <Icon type="info-circle" />
                                      </Tooltip>
                                    </span>
                                  </div>
                                </Form.Item>
                              </Col>
                            </Row>
                          )}
                        </>
                      )}
                      {hasMiscRewards && (
                        <Row>
                          <Col span={24}>
                            <div className="trading-fee-credits-more-info">
                              <Interpolate
                                useDangerouslySetInnerHTML
                                i18nKey="settings.rewards.feeCredits.moreDetails"
                                link={
                                  <a
                                    href={promosAndOffersPageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Trans i18nKey="settings.rewards.feeCredits.promotionsAndOffers">
                                      Promotions & Offers
                                    </Trans>
                                  </a>
                                }
                              />
                            </div>
                          </Col>
                        </Row>
                      )}
                    </>
                  )}
                </>*/}
              </Form>
            </Col>
          </Row>
          {btcContract && (
            <Row className="settings-rewards-wrapper">
              <Col span={isMobile ? 24 : 12}>{renderFees(btcContract)}</Col>
            </Row>
          )}
        </Spin>
      </ChannelSubscription>
    );
  }
}

export default connect(mapStateToProps)(translate()(RewardsContainer));
