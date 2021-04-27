import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Interpolate, translate, Trans } from 'react-i18next';
import BigNumber from 'bignumber.js';

import { Col, Row, Spin, Icon } from '../../../../../common/components';
import { Button, Value, InfoTooltip, InputNumber } from '../../../../../common/components/trader';
import rules from '../../../../../common/rules';

const supportArticleUrl =
  'https://support.crypto.io/hc/en-us/articles/360039789793-Crypto-Token-Staking';

class Staking extends Component {
  static propTypes = {
    isFetching: PropTypes.bool.isRequired,
    isPosting: PropTypes.bool.isRequired,
    isDeleting: PropTypes.bool,
    stakingInfo: PropTypes.object.isRequired,
    getStakingInfo: PropTypes.func.isRequired,
    onPostStaking: PropTypes.func.isRequired,
    onDeleteStaking: PropTypes.func.isRequired,
    isMobile: PropTypes.bool,
  };

  state = {
    stakeAmount: undefined,
    unstakeAmount: undefined,
  };

  componentDidMount() {
    this.props.getStakingInfo();
  }

  render() {
    const {
      isFetching,
      isPosting,
      isDeleting,
      stakingInfo,
      onPostStaking,
      onDeleteStaking,
      isMobile,
      maxWithdrawable: maxStake,
    } = this.props;

    const maxUnstake = stakingInfo
      ? BigNumber(stakingInfo.amountStaked).minus(stakingInfo.amountToUnstake)
      : BigNumber(0);

    const { stakeAmount, unstakeAmount } = this.state;

    return (
      <Spin spinning={isFetching || isPosting || isDeleting}>
        <Row>
          <Col span={isMobile ? 24 : 14}>
            <Interpolate
              useDangerouslySetInnerHTML
              i18nKey="settings.staking.description"
              link={
                <a href={supportArticleUrl} target="_blank" rel="noopener noreferrer">
                  <Trans i18nKey="settings.staking.clickHere">Click here</Trans>
                </a>
              }
            />
          </Col>
        </Row>
        <Row>
          <Col span={isMobile ? 24 : 14}>
            <div className="settings-affiliates-wrapper">
              <div className="affiliate-count-wrapper">
                {BigNumber(stakingInfo.amountStaked).gt(0) && (
                  <>
                    <div className="affiliate-count-header">
                      <Trans i18nKey="settings.staking.info.tokensStaked"># of tokens staked</Trans>
                    </div>
                    <div className="affiliate-count-content">
                      <Value.Numeric
                        type="token"
                        token={'ACDX'}
                        decimals={18}
                        value={stakingInfo.amountStaked}
                      />
                    </div>
                  </>
                )}
                {BigNumber(stakingInfo.amountToUnstake).gt(0) && (
                  <>
                    <div className="affiliate-count-header">
                      <InfoTooltip
                        title={
                          <Interpolate
                            useDangerouslySetInnerHTML
                            i18nKey="settings.staking.info.pendingUnstakeTooltip"
                            date={<Value.Date type="datetime" value={stakingInfo.nextPayoutAt} />}
                          />
                        }
                      >
                        <Trans i18nKey="settings.staking.info.pendingUnstake">
                          # of tokens pending unstake
                        </Trans>
                      </InfoTooltip>
                    </div>
                    <div className="affiliate-count-content">
                      <Value.Numeric
                        type="token"
                        token={'ACDX'}
                        decimals={18}
                        value={stakingInfo.amountToUnstake || 0}
                      />
                    </div>
                  </>
                )}
                {BigNumber(stakingInfo.expectedPayoutShare).gt(0) && (
                  <>
                    <div className="affiliate-count-header">
                      <InfoTooltip
                        title={<Trans i18nKey="settings.staking.info.expectedShareTooltip" />}
                      >
                        <Trans i18nKey="settings.staking.info.expectedShare">
                          Your expected share
                        </Trans>
                      </InfoTooltip>
                    </div>
                    <div className="affiliate-count-content">
                      <Value.Numeric type="percentage" value={stakingInfo.expectedPayoutShare} />
                    </div>
                  </>
                )}
                <div className="affiliate-count-header">
                  <InfoTooltip title={<Trans i18nKey="settings.staking.info.totalPayoutTooltip" />}>
                    <Trans i18nKey="settings.staking.info.totalPayout">
                      Total payout to stakers
                    </Trans>
                  </InfoTooltip>
                </div>
                <div className="affiliate-count-content">
                  <Value.Numeric
                    type="token"
                    token={'BTC'}
                    decimals={8}
                    value={stakingInfo.currentPayoutBtc}
                  />
                </div>
                <div className="affiliate-count-header">
                  <Trans i18nKey="settings.staking.info.countdownToPayout">Next payout in</Trans>
                </div>
                <div className="affiliate-count-content">
                  <Value.Duration reverted value={stakingInfo.nextPayoutAt} verbose />
                </div>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={isMobile ? 24 : 14}>
            {BigNumber(stakingInfo.amountStaked).eq(0) &&
            BigNumber(stakingInfo.amountToUnstake).eq(0) &&
            BigNumber(maxStake).eq(0) ? (
              <div className="disclaimer-wrapper">
                <Icon type="info-circle" />
                <Interpolate
                  useDangerouslySetInnerHTML
                  i18nKey="settings.staking.noACDXTokens"
                  link={<Link to="/trader/ACDX-BTC">ACDX-BTC</Link>}
                />
              </div>
            ) : (
              <>
                <div className="staking-input-wrapper">
                  <h4>
                    <Trans i18nKey="settings.staking.actions.stakeTokens">Stake Crypto Tokens</Trans>
                    <div
                      className="max-stake-btn"
                      onClick={() => this.setState({ stakeAmount: maxStake })}
                    >
                      max
                    </div>
                  </h4>
                  <InputNumber
                    value={stakeAmount}
                    min={0}
                    step={1}
                    onChange={value => this.setState({ stakeAmount: value })}
                    placeholder={'0'}
                    rules={[rules.positiveNumber, rules.number, rules.multipleOf(1e-18)]}
                  />
                  <Button
                    block
                    disabled={!BigNumber(stakeAmount).isFinite() || BigNumber(stakeAmount).isZero()}
                    size="medium"
                    type="ghost"
                    onClick={() => {
                      onPostStaking(stakeAmount);
                      this.setState({ stakeAmount: undefined });
                    }}
                  >
                    <Trans i18nKey="settings.staking.actions.stakeTokens">Stake Crypto Tokens</Trans>
                  </Button>
                </div>
                <div className="staking-input-wrapper">
                  <h4>
                    <Trans i18nKey="settings.staking.actions.unstakeTokens">
                      Unstake Crypto Tokens
                    </Trans>
                    {maxUnstake.gt(0) && (
                      <div
                        className="max-stake-btn"
                        onClick={() => this.setState({ unstakeAmount: maxUnstake })}
                      >
                        max
                      </div>
                    )}
                  </h4>
                  <InputNumber
                    value={unstakeAmount}
                    min={0}
                    step={1}
                    onChange={value => this.setState({ unstakeAmount: value })}
                    placeholder={'0'}
                    rules={[rules.positiveNumber, rules.number, rules.multipleOf(1e-18)]}
                  />
                  <Button
                    block
                    disabled={
                      !BigNumber(unstakeAmount).isFinite() || BigNumber(unstakeAmount).isZero()
                    }
                    size="medium"
                    type="ghost"
                    onClick={() => {
                      onDeleteStaking(unstakeAmount);
                      this.setState({ unstakeAmount: undefined });
                    }}
                  >
                    <Trans i18nKey="settings.staking.actions.unstakeTokens">
                      Unstake Crypto Tokens
                    </Trans>
                  </Button>
                </div>
              </>
            )}
          </Col>
        </Row>
        <Row>
          <Col span={isMobile ? 24 : 14}>
            <div className="staking-notes-header">Note:</div>
            <div className="staking-notes-wrapper">
              <div>
                <Trans i18nKey="settings.staking.footer.bullet1" />
              </div>
              <div>
                <Trans i18nKey="settings.staking.footer.bullet2" />
              </div>
              <div>
                <Interpolate
                  useDangerouslySetInnerHTML
                  i18nKey="settings.staking.footer.bullet3"
                  link={
                    <Link to="/settings/history">
                      <Trans i18nKey="settings.history.header">Transaction History</Trans>
                    </Link>
                  }
                />
              </div>
            </div>
          </Col>
        </Row>
      </Spin>
    );
  }
}

export default translate()(Staking);
