import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { t } from '../../../../common/services/i18n';
import { PageTitle, Spin } from '../../../../common/components';
import { Select, Table } from '../../../../common/components/trader';

import { RankColumn, NameColumn, NotionalGain } from '../../columns';

import { NO_CONTRACT_VALUE } from '../../ducks';

const columns = () => [
  RankColumn({ dataIndex: 'rank', width: 4 }),
  NameColumn({ dataIndex: 'alias', width: 60 }),
  NotionalGain({
    dataIndex: 'value',
    width: 20,
    title: t('competition.leaderboard.column.notionalPl'),
  }),
];

const columnsFees = () => [
  RankColumn({ dataIndex: 'rank', width: 4 }),
  NameColumn({ dataIndex: 'alias', width: 60 }),
  NotionalGain({
    dataIndex: 'value',
    width: 20,
    title: t('competition.leaderboard.column.feesEarned'),
  }),
];

class Leaderboard extends Component {
  static propTypes = {
    contracts: PropTypes.array.isRequired,
    leaderboard: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]).isRequired,
    isLoading: PropTypes.bool,
  };

  state = {
    contract: NO_CONTRACT_VALUE,
  };

  handleContractSelect = contract => this.setState({ contract });

  render() {
    const {
      contracts,
      leaderboard: { plNotional, plNotionalPerContract, feesNet },
      isLoading,
    } = this.props;
    const { contract } = this.state;
    const { label } = contracts.find(({ value }) => value === contract);
    const contractLabel = contract !== NO_CONTRACT_VALUE ? ` (${label})` : '';

    return (
      <div className="global-leaderboard-wrapper">
        <PageTitle title={`Crypto | ${t('settings.competitions.column.leaderboard')}`} />
        <h1>{t('competition.leaderboard.title', { defaultValue: 'Crypto All-Time Leaderboard' })}</h1>
        <div>{t('competition.leaderboard.note')}</div>
        <Spin spinning={isLoading}>
          <div className="notional-wrapper">
            <h2>
              {t('competition.leaderboard.header.notionalPl', {
                defaultValue: 'Notional PL Leaders',
              })}
              {contractLabel}
            </h2>
            {contracts.length > 1 && (
              <div className="contract-select-wrapper">
                <Select value={contract} onChange={this.handleContractSelect}>
                  {contracts.map(({ label, value }) => (
                    <Select.Option key={value} value={value}>
                      {label}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            )}
          </div>
          <Table
            columns={columns()}
            dataSource={
              contract && plNotionalPerContract[contract]
                ? plNotionalPerContract[contract]
                : plNotional
            }
            id="global-leaderboard-pl"
            rowKey="rank"
            enableResize
          />
          <h2>
            {t('competition.leaderboard.header.feesEarned', { defaultValue: 'Net Fee Earners' })}
          </h2>
          <Table
            columns={columnsFees()}
            dataSource={feesNet}
            id="global-leaderboard-fees-earned"
            rowKey="rank"
            enableResize
          />
        </Spin>
      </div>
    );
  }
}

export default Leaderboard;
