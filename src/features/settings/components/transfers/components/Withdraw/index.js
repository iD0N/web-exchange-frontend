import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans, translate } from 'react-i18next';
import localStorage from 'localStorage';

import { logoutAction, selectAuthTime } from '../../../../../../common/services/user';
import { Col, Form } from '../../../../../../common/components';
import { Input, Value } from '../../../../../../common/components/trader';

import { selectMaxWithdrawal } from '../../ducks';
import { selectWithdrawalFee } from '../../ducks';
import WithdrawalForm from './Form';

const mapStateToProps = state => ({
  authTime: selectAuthTime(state),
  maxWithdrawal: selectMaxWithdrawal(state),
  withdrawalFee: selectWithdrawalFee(state),
});

const mapDispatchToProps = {
  logout: logoutAction,
};

let timeout;

class Withdraw extends Component {
  static propTypes = {
    authTime: PropTypes.number.isRequired,
    isMobile: PropTypes.bool,
    isRequestingWithdrawal: PropTypes.bool.isRequired,
    maxWithdrawal: PropTypes.number.isRequired,
    onSubmit: PropTypes.func.isRequired,
    token: PropTypes.string.isRequired,
    withdrawalFee: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      eligible: Date.now() - this.props.authTime <= 1000 * 60 * 15,
    };
  }

  componentDidMount() {
    if (this.state.eligible) {
      const delta = Date.now() - this.props.authTime;
      const timeToIneligible = 1000 * 60 * 15 - delta;
      timeout = setTimeout(() => {
        this.setState({ eligible: false });
      }, timeToIneligible);
    }
  }

  componentWillUnmount() {
    clearTimeout(timeout);
  }

  handleLogout = () => {
    try {
      localStorage.setItem('redirectPathname', '/settings/transfers');
    } catch (err) {}
    this.props.logout(true);
  };

  render() {
    const {
      authTime,
      isMobile,
      isRequestingWithdrawal,
      maxWithdrawal,
      onSubmit,
      token,
      t,
      withdrawalFee,
    } = this.props;

    return (
      <Col className="withdraw-funds-wrapper" span={isMobile ? 24 : 12}>
        <h2>
          <Trans i18nKey="settings.transfers.withdrawals.action">Withdraw</Trans>
        </h2>
        {this.state.eligible ? (
          <>
            <div className="withdraw-expiration-countdown">
              <div>
                <Trans i18nKey="settings.transfers.withdrawals.timeRemaining">
                  Time remaining:{' '}
                </Trans>
                <Value.Duration reverted verbose value={authTime + 1000 * 60 * 15} />
              </div>
              <div>
                <Trans i18nKey="settings.transfers.withdrawals.timeRemainingDetail">
                  For security purposes, you will have to re-login to your account after this time
                  in order to withdraw funds.
                </Trans>
              </div>
            </div>
            <div className="token-balance-wrapper">
              <Col span={isMobile ? 24 : 12}>
                <Form.Item
                  className="withdrawals-token-balance"
                  colon={false}
                  id="withdrawals-token-balance"
                  label={t('settings.transfers.withdrawals.availableBalance', {
                    token,
                    defaultValue: `Available ${token} Balance`,
                  })}
                >
                  {!isNaN(maxWithdrawal) && <Input value={maxWithdrawal} />}
                </Form.Item>
              </Col>
              <Col span={isMobile ? 24 : 12} />
            </div>
            <WithdrawalForm
              isSubmitting={isRequestingWithdrawal}
              maxValue={maxWithdrawal}
              onSubmit={onSubmit}
              token={token}
              withdrawalFee={withdrawalFee}
            />
          </>
        ) : (
          <div className="withdraw-expiration-countdown">
            <Trans i18nKey="settings.transfers.withdrawals.timeRemainingDisclaimer">
              For security purposes, you must log in again to withdraw funds. Funds can only be
              withdrawn within 15 minutes of account login.{' '}
            </Trans>{' '}
            <span className="relogin" onClick={this.handleLogout}>
              <Trans i18nKey="settings.transfers.withdrawals.relogin">
                Click here to log out and back in
              </Trans>
            </span>
            .
          </div>
        )}
      </Col>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(translate()(Withdraw));
