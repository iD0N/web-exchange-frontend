import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';

import { connectSpinner } from '../../../../common/services/spinner';
import { t } from '../../../../common/services/i18n';
import { selectAccountTraderId } from '../../../../common/services/accounts';
import ChannelSubscription from '../../../trader/ws-subscription/containers/ChannelSubscription';
import ContractSubscription from '../../../trader/ws-subscription/containers/ContractSubscription';
import { Alert, Col, ElementResizeDetector, Row } from '../../../../common/components';
import { Select } from '../../../../common/components/trader';
import { WS_CHANNELS } from '../../../trader/constants';
import { selectPositionsContracts } from '../../../trader/features/positions/ducks';
import { fetchOpenOrdersAction } from '../../../trader/features/orders/ducks';
import {
  selectBtcContractCode,
  selectCollateralTokens,
  selectTransferableTokens,
  selectUSDStableTokens,
  selectParentTokensWithWithdrawableChildren,
} from '../../../trader/data-store/ducks';

import {
  cancelWithdrawalAction,
  fetchTransfersActions,
  fetchDepositAddressActions,
  requestWithdrawalActions,
  selectDepositAddresses,
  selectFilteredTransfers,
  selectToken,
  setTokenAction,
} from './ducks';
import { apiCallIds } from './api';

import Deposit from './components/Deposit';
import TransfersTable from './components/TransfersTable';
import Withdraw from './components/Withdraw';

const getSettingsWrapperElem = () => document.getElementById('settings-subpage-wrapper');

const condensed = width => width <= 850;

const EnhancedTransfersTable = connectSpinner({
  isRequestingTransfers: apiCallIds.GET_TRANSFERS,
})(TransfersTable);

const EnhancedWithdraw = connectSpinner({
  isRequestingWithdrawal: apiCallIds.REQUEST_WITHDRAWAL,
})(Withdraw);

const mapStateToProps = state => ({
  addresses: selectDepositAddresses(state),
  btcContractCode: selectBtcContractCode(state),
  positionsContracts: selectPositionsContracts(state),
  traderId: selectAccountTraderId(state),
  transfers: selectFilteredTransfers(state),
  token: selectToken(state),
  tokens: selectTransferableTokens(state),
  usdStableTokens: selectUSDStableTokens(state),
  fiatParentTokens: selectParentTokensWithWithdrawableChildren(state),
  collateralTokens: selectCollateralTokens(state),
});

const mapDispatchToProps = {
  cancelWithdrawal: cancelWithdrawalAction.request,
  fetchAddress: fetchDepositAddressActions.request,
  fetchTransfers: fetchTransfersActions.request,
  fetchOpenOrders: fetchOpenOrdersAction.request,
  requestWithdrawal: requestWithdrawalActions.request,
  setToken: setTokenAction,
};

class TransfersContainer extends Component {
  static propTypes = {
    btcContractCode: PropTypes.string,
    cancelWithdrawal: PropTypes.func.isRequired,
    fetchTransfers: PropTypes.func.isRequired,
    fetchAddress: PropTypes.func.isRequired,
    isMobile: PropTypes.bool,
    positionsContracts: PropTypes.array.isRequired,
    requestWithdrawal: PropTypes.func.isRequired,
    traderId: PropTypes.string,
    token: PropTypes.string.isRequired,
  };

  componentDidMount() {
    if (!!this.props.traderId) {
      this.props.fetchAddress();
      this.props.fetchTransfers();
      this.props.fetchOpenOrders();
    }
  }

  componentDidUpdate({ traderId: prevTraderId, token: prevToken }) {
    const { traderId, fetchAddress, fetchTransfers, addresses, token } = this.props;

    if (!traderId) {
      return;
    }

    if (!prevTraderId) {
      fetchAddress();
      fetchTransfers();
      return;
    }

    if (prevToken !== token && !addresses[token]) {
      fetchAddress();
    }
  }

  handleTokenChange = token => this.props.setToken(token);

  tokenSelect = () => (
    <div className="transfer-token-select-wrapper">
      <Row>
        <h2>
          <Trans i18nKey="settings.transfers.table.column.token">Token</Trans>
        </h2>
        <Select size="large" value={this.props.token} onChange={this.handleTokenChange}>
          {this.props.tokens.map(({ tokenCode: value }) => (
            <Select.Option key={value} value={value}>
              {value}
            </Select.Option>
          ))}
        </Select>
      </Row>
      {!this.props.collateralTokens
        .map(({ tokenCode }) => tokenCode)
        .includes(this.props.token) && (
        <Row>
          <Alert
            message={t('settings.transfers.collateralDisclaimer', {
              defaultValue: `Note: ${this.props.token} is not currently a supported form of collateral for derivative positions on Crypto. We will be adding support for non-BTC collateral in the coming weeks. In the meantime, you may deposit ${this.props.token} to trade spot markets.`,
              tokenCode: this.props.token,
            })}
            type="warning"
          />
        </Row>
      )}
    </div>
  );

  USDStablecoinTokenSelect = () => (
    <div className="transfer-token-select-wrapper">
      <Row>
          <Select size="large" value={<Trans i18nKey="settings.transfers.depositUSD.selectDefault">Select USD Stablecoin</Trans>} onChange={this.handleTokenChange}>
          {this.props.usdStableTokens.map(({ tokenCode: value }) => (
            <Select.Option key={value} value={value}>
              {value}
            </Select.Option>
          ))}
        </Select>
      </Row>      
    </div>
  );

  render() {
    const {
      addresses,
      btcContractCode,
      cancelWithdrawal,
      isMobile,
      positionsContracts,
      requestWithdrawal,
      transfers,
      token,
    } = this.props;

    return (
      <ChannelSubscription channel={WS_CHANNELS.BALANCES}>
        <ChannelSubscription channel={WS_CHANNELS.ORDERS}>
          <ContractSubscription
            channel={WS_CHANNELS.TICKER}
            contractCodes={
              positionsContracts.includes(btcContractCode)
                ? positionsContracts
                : [...positionsContracts, btcContractCode]
            }
          >
            <ChannelSubscription channel={WS_CHANNELS.TRANSFERS}>
              <ElementResizeDetector elementSelector={getSettingsWrapperElem}>
                {({ width }) => (
                  <>
                    {isMobile || condensed(width) ? (
                      <Col>
                        {this.tokenSelect()}
                        <Row>
                        {token === 'USD' ? (
                            <Col span={isMobile ? 24 : 12}>
                              <Row>
                                <Col span={24}>
                                  <h2>
                                    <Trans i18nKey="settings.transfers.depositUSD.title">
                                    Deposit and Withdraw USD with any of the following Stablecoins
                                    </Trans>
                                    {this.USDStablecoinTokenSelect()}
                                  </h2>
                                </Col>
                              </Row>
                            </Col>
                          ) :
                            (
                            <>
                              <Deposit address={addresses[token]} ismobile token={token} />
                              <EnhancedWithdraw isMobile onSubmit={requestWithdrawal} token={token} />
                              <EnhancedTransfersTable
                                onCancel={cancelWithdrawal}
                                transfers={transfers}
                              />
                            </>
                          )}
                        </Row>
                      </Col>
                    ) : (
                      <Col>
                        {this.tokenSelect()}
                        <Row>
                          {token === 'USD' ? (
                            <Col span={isMobile ? 24 : 12}>
                              <Row>
                                <Col span={24}>
                                  <h2>
                                    <Trans i18nKey="settings.transfers.depositUSD.title">
                                    Deposit and Withdraw USD with any of the following Stablecoins
                                    </Trans>
                                    {this.USDStablecoinTokenSelect()}
                                  </h2>
                                </Col>
                              </Row>
                            </Col>
                          ) :
                            (
                            <>
                              <Deposit address={addresses[token]} token={token} />
                              <EnhancedWithdraw onSubmit={requestWithdrawal} token={token} />
                              <EnhancedTransfersTable
                                onCancel={cancelWithdrawal}
                                transfers={transfers}
                              />
                            </>
                          )}                          
                        </Row>
                      </Col>
                    )}
                  </>
                )}
              </ElementResizeDetector>
            </ChannelSubscription>
          </ContractSubscription>
        </ChannelSubscription>
      </ChannelSubscription>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TransfersContainer);
