import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Interpolate, translate, Trans } from 'react-i18next';
import BigNumber from 'bignumber.js';

import { t } from '../../../../../common/services/i18n';
import { Col, Row, Spin } from '../../../../../common/components';
import {
  Button,
  Currency,
  Input,
  Table,
  DeleteIconButton,
  Select,
  Value,
} from '../../../../../common/components/trader';

const { DescriptionHeader } = Table;

const supportArticleUrl = 'https://support.crypto.io/hc/en-us/articles/360039241073-Subaccounts';

class SubAccounts extends Component {
  static propTypes = {
    //    isFetching: PropTypes.bool.isRequired,
    isCreating: PropTypes.bool.isRequired,
    isDeleting: PropTypes.bool.isRequired,
    isTransferring: PropTypes.bool,
    isMobile: PropTypes.bool,
    accounts: PropTypes.array.isRequired,
    onCreateClick: PropTypes.func.isRequired,
    onDeleteClick: PropTypes.func.isRequired,
  };

  state = {
    alias: '',
    fromTraderId: undefined,
    toTraderId: undefined,
    amount: 0,
  };

  columns = [
    {
      dataIndex: 'displayName',
      title: <Trans i18nKey="settings.subaccounts.alias">Alias</Trans>,
      render: (value, { isSelectedTraderId }) =>
        isSelectedTraderId ? <span className="active-trader-highlight">{value}</span> : value,
      width: 75,
    },
    {
      align: 'right',
      dataIndex: 'netLiquidationValue',
      title: (
        <DescriptionHeader>
          <Trans i18nKey="trader.accountBalance.netLiquidity">Total Collateral</Trans>
          <Currency inline />
        </DescriptionHeader>
      ),
      width: 40,
      render: value => (value ? <Value.Numeric noPrefix type="currency" value={value} /> : null),
    },
    {
      align: 'center',
      key: 'actions',
      render: (_, { isPrimary, traderId }) =>
        !isPrimary && (
          <DeleteIconButton
            tooltipVisible={false}
            onClick={() => this.props.onDeleteClick(traderId)}
          />
        ),
      title: <Trans i18nKey="trader.control.delete">Delete</Trans>,
      width: 15,
    },
  ];

  componentDidMount() {
    this.setInitialValues();
  }

  componentDidUpdate({ accounts: prevAccounts }) {
    if (prevAccounts.length !== this.props.accounts.length) {
      this.setInitialValues();
    }
  }

  setInitialValues() {
    const { accounts, currentTraderId } = this.props;
    if (accounts.length > 0) {
      const currentAccount = accounts.find(({ traderId }) => traderId === currentTraderId);
      if (!currentAccount || accounts.length === 1 || (currentAccount && currentAccount.isPrimary)) {
        this.setState({
          fromTraderId: accounts[0].traderId,
          toTraderId: accounts[1] ? accounts[1].traderId : accounts[0].traderId,
          amount: 0,
        });
      } else {
        const primaryTrader = accounts.find(({ isPrimary }) => !!isPrimary);
        this.setState({
          fromTraderId: currentAccount.traderId,
          toTraderId: primaryTrader.traderId,
          amount: 0,
        });
      }
    }
  }

  render() {
    const {
      //      isFetching,
      isCreating,
      isDeleting,
      isTransferring,
      isMobile,
      accounts,
      maxTransfer,
      onCreateClick,
      setToken,
      token,
      tokens,
      onTransferClick,
    } = this.props;

    const { alias, fromTraderId, toTraderId, amount } = this.state;

    return (
      <div className="subaccounts-wrapper">
        <Row>
          <Col span={isMobile ? 24 : 14}>
            <Interpolate
              useDangerouslySetInnerHTML
              i18nKey="settings.subaccounts.description"
              link={
                <a href={supportArticleUrl} target="_blank" rel="noopener noreferrer">
                  <Trans i18nKey="settings.subaccounts.clickHere">Click here</Trans>
                </a>
              }
            />
          </Col>
        </Row>
        <Row>
          <Col span={isMobile ? 24 : 14}>
            <Spin spinning={accounts.length === 0 || isCreating || isDeleting || isTransferring}>
              {accounts.length > 0 && (
                <Table
                  columns={accounts.length > 1 ? this.columns : this.columns.slice(0, 1)}
                  loading={accounts.length === 0 || isCreating || isDeleting || isTransferring}
                  dataSource={accounts}
                  id="subaccounts"
                  rowKey="traderId"
                />
              )}
              <div className="subaccounts-create-wrapper">
                <div className="subaccounts-alias-input">
                  <Input
                    value={alias}
                    onChange={({ target: { value } }) => this.setState({ alias: value })}
                    placeholder={t('settings.subaccounts.fields.alias', {
                      defaultValue: 'Subaccount Alias (Optional)',
                    })}
                  />
                </div>
                <Button
                  block
                  size="medium"
                  onClick={() => {
                    onCreateClick({ alias: alias });
                    this.setState({ alias: '' });
                  }}
                >
                  <Trans i18nKey="settings.subaccounts.createNew">Create New Subaccount</Trans>
                </Button>
              </div>
              {!!toTraderId && (
                <div className="internal-transfers-wrapper">
                  <h1>
                    <Trans i18nKey="settings.subaccounts.internalTransfers">
                      Internal Transfers
                    </Trans>
                  </h1>
                  <div className="subaccounts-transfers-wrapper">
                    <Row>
                      <Col span={12}>
                        <div className="label">
                          <Trans i18nKey="settings.subaccounts.label.from">From</Trans>
                        </div>
                        <div>
                          <Select
                            disabled
                            value={fromTraderId}
                            onChange={val => this.setState({ fromTraderId: val })}
                          >
                            {accounts.map(({ displayName, traderId }) => (
                              <Select.Option key={traderId} value={traderId}>
                                {displayName}
                              </Select.Option>
                            ))}
                          </Select>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="label">
                          <Trans i18nKey="settings.subaccounts.label.to">To</Trans>
                        </div>
                        <div>
                          <Select
                            value={toTraderId}
                            onChange={val => this.setState({ toTraderId: val })}
                          >
                            {accounts.map(({ displayName, traderId }) => (
                              <Select.Option key={traderId} value={traderId}>
                                {displayName}
                              </Select.Option>
                            ))}
                          </Select>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={12}>
                        <div className="label">
                          <Trans i18nKey="settings.subaccounts.label.asset">Asset</Trans>
                        </div>
                        <div>
                          <Select
                            value={token}
                            onChange={val => { setToken(val); this.setState({ amount: 0 }) }}
                          >
                            {tokens.map(({ tokenCode }) => (
                              <Select.Option key={tokenCode} value={tokenCode}>
                                {tokenCode}
                              </Select.Option>
                            ))}
                          </Select>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="label">
                          <Trans i18nKey="settings.subaccounts.label.amount">Amount</Trans>
                        </div>
                        <div>
                          <Input
                            value={amount}
                            onChange={({ target: { value } }) => this.setState({ amount: value })}
                            placeholder={t('settings.subaccounts.fields.transferAmount', {
                              defaultValue: 'Amount',
                            })}
                          />
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={12}>
                        <div className="available-balance-wrapper">
                          <div>
                            <Trans i18nKey="settings.subaccounts.availableBalance">Available Balance:</Trans>
                          </div>
                          <div>{maxTransfer}</div>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="max-balance-select" onClick={() => this.setState({ amount: String(maxTransfer) })}>
                          <Trans i18nKey="settings.transfers.withdrawals.max">Max</Trans>
                        </div>
                      </Col>
                    </Row>
                  </div>
                  <Button
                    block
                    size="medium"
                    disabled={fromTraderId === toTraderId || BigNumber(amount).isZero()}
                    onClick={() => {
                      onTransferClick({ fromTraderId, toTraderId, tokenCode: token, amount });
                      this.setState({ amount: 0 });
                    }}
                  >
                    <Trans i18nKey="settings.subaccounts.transferAsset">Transfer Asset</Trans>
                  </Button>
                </div>
              )}
            </Spin>
          </Col>
        </Row>
      </div>
    );
  }
}

export default translate()(SubAccounts);
