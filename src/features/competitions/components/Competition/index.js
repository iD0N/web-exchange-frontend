import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import cn from 'classnames';

import { Icon, PageTitle, Spin } from '../../../../common/components';
import {
  Button,
  Checkbox,
  InfoTooltip,
  Select,
  Table,
  Value,
} from '../../../../common/components/trader';

import {
  RankColumn,
  NameColumn,
  TradeCountColumn,
  TradeVolumeColumn,
  SharpeRatioColumn,
  ReferralCountColumn,
  RektPercentColumn,
  ValueChangeColumn,
} from '../../columns';
import Chart from './Chart';

const columns = [
  RankColumn(),
  NameColumn(),
  ReferralCountColumn(),
  TradeCountColumn(),
  TradeVolumeColumn(),
  SharpeRatioColumn(),
  RektPercentColumn(),
  ValueChangeColumn(),
];

const columnsNotStarted = [RankColumn(), NameColumn(), ReferralCountColumn()];

const getHostname = () => {
  const { hostname } = window.location;
  return hostname === 'localhost' ? 'http://localhost:3000' : 'https://' + hostname;
};

class Competition extends Component {
  static propTypes = {
    isCreator: PropTypes.bool,
    competition: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]).isRequired,
    fetchCompetition: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
  };

  state = {
    hideIneligible: true,
    showMore: false,
  };

  componentDidUpdate({ competition: prevCompetition }) {
    const { competition } = this.props;
    if (prevCompetition.competitionId !== competition.competitionId && !!competition.requirements) {
      this.setState({
        hideIneligible:
          competition.requirements.length > 0 ? competition.hideIneligibleByDefault : false,
      });
    }
  }

  handleToggleShowMore = () => this.setState({ showMore: !this.state.showMore });

  render() {
    const {
      affiliate,
      competition,
      competition: {
        chartData,
        competitionId,
        code,
        startDate,
        endDate,
        leaderboard: dataSource,
        label,
        loaded,
        isActive,
        isUpcoming,
        isExpired,
        eligibleAnonymousNames,
        requirements,
      },
      competitionCode,
      contractCode,
      contracts,
      handleContractCodeChange,
      fetchCompetition,
      isCreator,
      isLoading,
    } = this.props;
    const { hideIneligible, showMore } = this.state;

    const leaderboard = hideIneligible
      ? (dataSource || []).filter(({ isEligible }) => !!isEligible)
      : dataSource;

    const visibleTradersLength = leaderboard
      ? showMore
        ? leaderboard.length
        : leaderboard.filter((item, index) => index < 10 || item.isCurrentUser).length
      : 0;

    return (
      <>
        {label && <PageTitle title={'Crypto | ' + label} />}
        <Spin spinning={!competition || !competition.leaderboard}>
          {competition && competition.leaderboard ? (
            <>
              <h1>{label}</h1>
              <div className="expiration">
                {isUpcoming && (
                  <div className="in-future">
                    <Trans i18nKey="competition.header.begins">Begins</Trans>{' '}
                    <Value.Date type="datetime" value={startDate} /> (in{' '}
                    <Value.Duration reverted verbose value={startDate} />)
                  </div>
                )}
                {isActive && (
                  <>
                    <Trans i18nKey="competition.header.ends">Ends</Trans>{' '}
                    <Value.Date type="datetime" value={endDate} /> (in{' '}
                    <Value.Duration reverted verbose value={endDate} />)
                  </>
                )}
                {isExpired && (
                  <>
                    <Trans i18nKey="competition.header.ended">Ended</Trans>{' '}
                    <Value.Date type="datetime" value={endDate} />
                  </>
                )}
              </div>
              {!competitionCode && code && (
                <div>
                  <Link to={`/compete/${code}`}>
                    <div className="competition-public-join-link">
                      Click here to join this competition!
                    </div>
                  </Link>
                </div>
              )}
              {competitionCode && (
                <div className="competition-code">
                  <Trans i18nKey="competition.header.inviteCode">Invite code</Trans>:{' '}
                  <b className="auto-select-all">{competitionCode}</b>
                </div>
              )}
              {competitionCode && (
                <div className={cn('competition-code', 'competition-code-referral')}>
                  <Trans i18nKey="competition.header.inviteLink.title">
                    Competition Referral Link
                  </Trans>
                  :{' '}
                  <b className="auto-select-all">
                    {getHostname()}/compete/{competitionCode}
                    {!isCreator && affiliate ? '/' + affiliate : ''}
                  </b>
                  <InfoTooltip
                    title={
                      <Trans i18nKey="competition.header.inviteLink.tooltip">
                        When a trader joins Crypto through this competition join link, you will earn a
                        percentage of their trading fees per the referral program.
                      </Trans>
                    }
                  />
                </div>
              )}
              {competitionId && competitionCode && (
                <div className="competition-code">
                  <Trans i18nKey="competition.header.publicLink.title">
                    Public leaderboard link
                  </Trans>
                  :{' '}
                  <b className="auto-select-all">
                    {getHostname()}/competition/{competitionId}
                  </b>
                  <InfoTooltip
                    title={
                      <Trans i18nKey="competition.header.publicLink.tooltip">
                        Go ahead and share your performance! Visitors to this link will not be able
                        to see the join link unless they are already competing in this competition.
                      </Trans>
                    }
                  />
                </div>
              )}
              <Spin spinning={isLoading}>
                <div className="update-btn-outer">
                  {!isUpcoming && (
                    <>
                      <Select value={contractCode} onChange={handleContractCodeChange}>
                        {contracts.map(({ label, value }) => (
                          <Select.Option key={value} value={value}>
                            {label}
                          </Select.Option>
                        ))}
                      </Select>
                      {!!requirements && requirements.length > 0 ? (
                        <Checkbox
                          checked={hideIneligible}
                          onChange={() => this.setState({ hideIneligible: !hideIneligible })}
                        >
                          <InfoTooltip
                            title={
                              <>
                                {requirements.map(({ label, value, unit }, index) => (
                                  <div key={index}>{`${label}: ${value} ${unit}`}</div>
                                ))}
                              </>
                            }
                          >
                            <Trans i18nKey="competition.hideIneligibleTraders">
                              Hide Ineligible Traders
                            </Trans>
                          </InfoTooltip>
                        </Checkbox>
                      ) : null}
                    </>
                  )}
                  {isActive && (
                    <div className="update-btn-content">
                      {!isLoading && (
                        <span className="last-updated">
                          <Trans i18nKey="competition.header.lastUpdated">Last updated</Trans>{' '}
                          <Value.Duration value={loaded} />{' '}
                          <Trans i18nKey="competition.header.ago">ago</Trans>
                        </span>
                      )}
                      <Spin spinning={isLoading}>
                        <Button type="ghost" size="small" onClick={fetchCompetition}>
                          <Icon type="reload" />
                          {isLoading ? (
                            <Trans i18nKey="competition.header.updatingResults" />
                          ) : (
                            <Trans i18nKey="competition.header.updateResults" />
                          )}
                        </Button>
                      </Spin>
                    </div>
                  )}
                </div>
                <Table
                  columns={isUpcoming ? columnsNotStarted : columns}
                  dataSource={leaderboard}
                  id="competition-leaderboard"
                  emptyText={<Trans i18nKey="competition.table.empty" />}
                  rowKey="index"
                  defaultSortKey="rank"
                  defaultSortOrder={Table.SORT_ORDERS.ASC}
                  enableResize
                  enableSort
                  rowClassName={({ isCurrentUser, preRank, rektPercent }, index) =>
                    [
                      !isUpcoming && !showMore && index > 9 && !isCurrentUser
                        ? 'hidden-row'
                        : isCurrentUser &&
                          index > 9 &&
                          leaderboard.length > 10 &&
                          !(preRank & 1) &&
                          !showMore
                        ? 'with-odd-bg'
                        : '',
                      rektPercent > 1 ? 'very-rekt' : '',
                    ].join(' ')
                  }
                />
                {(isActive || isExpired) &&
                  (showMore
                    ? leaderboard.length > 10
                    : leaderboard.length !== visibleTradersLength) && (
                    <div className="leaderboard-show-more" onClick={this.handleToggleShowMore}>
                      {showMore ? (
                        <Trans i18nKey="competition.header.showTopTen" />
                      ) : (
                        <>
                          <Trans i18nKey="competition.header.showAll" /> ({leaderboard.length})
                        </>
                      )}
                    </div>
                  )}
                <Chart
                  chartData={chartData}
                  hideIneligible={hideIneligible}
                  eligibleAnonymousNames={eligibleAnonymousNames}
                />
              </Spin>
            </>
          ) : null}
        </Spin>
      </>
    );
  }
}

export default Competition;
