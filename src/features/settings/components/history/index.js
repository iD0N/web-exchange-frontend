import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';
import { CSVDownload } from 'react-csv';

import { connectSpinner } from '../../../../common/services/spinner';
import { selectAccountTraderId } from '../../../../common/services/accounts';
import { Col, Row, Spin } from '../../../../common/components';
import { Button, Checkbox, Table, Select } from '../../../../common/components/trader';
import { selectTokenBalancesLoaded } from '../../../trader/data-store/ducks';

import {
  BalanceColumn,
  CreatedColumn,
  SizeColumn,
  TransactionIdColumn,
  ContractColumn,
  EventColumn,
  ValueColumn,
} from './columns';
import {
  selectLedger,
  selectLedgerSums,
  selectLedgerSummaryData,
  selectLedgerCsvData,
  selectLedgerTransactionsData,
  fetchLedgerActions,
  fetchLedgerSummaryActions,
  fetchSummaryAsCsvAction,
  toggleTransactionTypeAction,
  selectLedgerTokenCode,
  selectLedgerTokenCodes,
  updateTokenCodeAction,
} from './ducks';
import { apiCallIds } from './api';
import { TRANSACTIONS } from './constants';

const columns = tokenCode => [
  TransactionIdColumn(),
  CreatedColumn(),
  ContractColumn(),
  EventColumn(),
  SizeColumn({ tokenCode }),
  BalanceColumn({ tokenCode }),
];

const columnsAll = [
  ValueColumn({ dataIndex: 'pl', type: TRANSACTIONS.PL }),
  ValueColumn({ dataIndex: 'funding', type: TRANSACTIONS.FUNDING }),
  ValueColumn({ dataIndex: 'fee', type: TRANSACTIONS.FEE }),
  ValueColumn({ dataIndex: 'affil', type: TRANSACTIONS.AFFIL }),
  ValueColumn({ dataIndex: 'xfer', type: TRANSACTIONS.XFER }),
  ValueColumn({ dataIndex: 'rebalance', type: TRANSACTIONS.REBALNCE }),
  ValueColumn({ dataIndex: 'swap', type: TRANSACTIONS.SWAP }),
  ValueColumn({ dataIndex: 'other', type: TRANSACTIONS.OTHER }),
];

const columnsSummary = [
  CreatedColumn({ dataIndex: 'date' }),
  ValueColumn({ dataIndex: 'pl', type: TRANSACTIONS.PL }),
  ValueColumn({ dataIndex: 'funding', type: TRANSACTIONS.FUNDING }),
  ValueColumn({ dataIndex: 'fee', type: TRANSACTIONS.FEE }),
  ValueColumn({ dataIndex: 'affil', type: TRANSACTIONS.AFFIL }),
  ValueColumn({ dataIndex: 'xfer', type: TRANSACTIONS.XFER }),
  ValueColumn({ dataIndex: 'rebalance', type: TRANSACTIONS.REBALNCE }),
  ValueColumn({ dataIndex: 'swap', type: TRANSACTIONS.SWAP }),
  ValueColumn({ dataIndex: 'other', type: TRANSACTIONS.OTHER }),
  BalanceColumn({ dataIndex: 'eodBalance', width: 80 }),
];

const mapStateToProps = state => ({
  traderId: selectAccountTraderId(state),
  ledger: selectLedger(state),
  ledgerSummaryData: selectLedgerSummaryData(state),
  ledgerSums: selectLedgerSums(state),
  csvData: selectLedgerCsvData(state),
  balanceDataLoaded: selectTokenBalancesLoaded(state),
  transactionTypes: selectLedgerTransactionsData(state),
  tokenCode: selectLedgerTokenCode(state),
  tokenCodes: selectLedgerTokenCodes(state),
});

const mapDispatchToProps = {
  fetchLedger: fetchLedgerActions.request,
  fetchLedgerSummary: fetchLedgerSummaryActions.request,
  fetchSummaryAsCsv: fetchSummaryAsCsvAction,
  toggleTransactionType: toggleTransactionTypeAction,
  updateTokenCode: updateTokenCodeAction,
};

class Ledger extends Component {
  static propTypes = {
    fetchLedger: PropTypes.func.isRequired,
    traderId: PropTypes.string,
    tokenCode: PropTypes.string,
    tokenCodes: PropTypes.array,
  };

  constructor(props) {
    super(props);
    this.state = {
      csvClicked: false,
      columns: columns(props.tokenCode),
    };
  }

  componentDidMount() {
    if (!!this.props.traderId && this.props.balanceDataLoaded) {
      this.props.fetchLedger();
      this.props.fetchLedgerSummary();
    }
  }

  componentDidUpdate({
    csvData: prevCsvData,
    traderId: prevTraderId,
    balanceDataLoaded: prevBalanceLoaded,
    tokenCode: prevTokenCode,
  }) {
    if (!prevTraderId && !!this.props.traderId && this.props.balanceDataLoaded) {
      this.props.fetchLedger();
      this.props.fetchLedgerSummary();
    } else if (!prevBalanceLoaded && this.props.balanceDataLoaded && !!this.props.traderId) {
      this.props.fetchLedger();
      this.props.fetchLedgerSummary();
    }

    if (!prevCsvData && this.props.csvData) {
      this.setState({ csvClicked: false });
    }

    if (prevTokenCode !== this.props.tokenCode) {
      this.setState({ columns: columns(this.props.tokenCode) });
    }
  }

  componentWillUnmount() {
    this.props.updateTokenCode('USD');
  }

  getCsv = () => {
    this.setState(
      {
        csvClicked: true,
      },
      () => {
        if (!this.props.csvData) {
          this.props.fetchSummaryAsCsv();
        }
      }
    );
  };

  render() {
    const {
      isRequestingLedger,
      isRequestingLedgerSummary,
      ledger,
      ledgerSummaryData,
      transactionTypes,
      ledgerSums,
      toggleTransactionType,
      tokenCode,
      tokenCodes,
      updateTokenCode,
    } = this.props;

    return (
      <Row>
        <Col span={24}>
          <h1>
            <Trans i18nKey="settings.history.header">Transaction History</Trans>
          </h1>
          <Spin spinning={isRequestingLedger}>
            <>
              <div className="transactions-options-wrapper">
                <div className="transaction-type-select-wrapper">
                  {transactionTypes.map(({ label, value, selected }) => (
                    <Checkbox
                      key={value}
                      checked={selected}
                      value={value}
                      onChange={toggleTransactionType}
                    >
                      <Trans i18nKey={label} />
                    </Checkbox>
                  ))}
                </div>
                <div className="transactions-contract-select-wrapper">
                  <Select value={tokenCode} onChange={updateTokenCode}>
                    {tokenCodes.map(value => (
                      <Select.Option key={value} value={value}>
                        {value}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </div>
              <Table
                columns={this.state.columns}
                dataSource={ledger}
                id="account-history"
                pageSize={14}
                rowKey="rowKey"
                defaultSortKey="createdAt"
                defaultSortOrder={Table.SORT_ORDERS.ASC}
                enableColumnOrdering
                enableResize
                enableSort
              />
            </>
          </Spin>
          <h1>
            <Trans i18nKey="settings.history.daily">Daily Transaction Summary</Trans>
          </h1>
          <div className="history-disclaimer">
            <Trans i18nKey="settings.history.disclaimer">
              Transactions in this summary are delayed up to 5 minutes. This summary may not include
              transactions completed in the last few minutes. This summary does not include
              unrealized P&L. All values are in USD.
            </Trans>
          </div>
          <Button type="ghost" onClick={this.getCsv}>
            <Trans i18nKey="settings.historyDaily.download">Download as CSV</Trans>
          </Button>
          <Spin spinning={isRequestingLedgerSummary}>
            {ledger.length > 0 && (
              <Table
                columns={columnsSummary}
                dataSource={ledgerSummaryData}
                id="account-history-summary"
                pageSize={20}
                rowKey="date"
                enableResize
              />
            )}
          </Spin>
          {this.state.csvClicked && this.props.csvData && (
            <CSVDownload data={this.props.csvData} target="_blank" />
          )}
          <h1>
            <Trans i18nKey="settings.history.all">All-time Transaction Sums</Trans>
          </h1>
          <div className="history-disclaimer">
            <Trans i18nKey="settings.history.disclaimer">
              Transactions in this summary are delayed up to 5 minutes. This summary may not include
              transactions completed in the last few minutes. This summary does not include
              unrealized P&L. All values are in USD.
            </Trans>
          </div>
          <Spin spinning={isRequestingLedgerSummary}>
            <Table
              columns={columnsAll}
              dataSource={ledgerSums}
              id="account-history-sums"
              pageSize={14}
              rowKey="rowKey"
              enableResize
            />
          </Spin>
        </Col>
      </Row>
    );
  }
}

export default connectSpinner({
  isRequestingLedger: apiCallIds.GET_LEDGER,
  isRequestingLedgerSummary: apiCallIds.GET_LEDGER_SUMMARY,
})(connect(mapStateToProps, mapDispatchToProps)(Ledger));
