import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { Spin } from '../../../../../common/components';
import { Table } from '../../../../../common/components/trader';

import {
  BegginingColumn,
  LabelColumn,
  InviteColumn,
  ExpirationColumn,
  ActionColumn,
} from '../columns';

const columnsUpcoming = [LabelColumn(), InviteColumn(), BegginingColumn(), ActionColumn()];
const columnsActive = [LabelColumn(), InviteColumn(), ExpirationColumn(), ActionColumn()];
const columnsExpired = [
  LabelColumn({ width: 60 }),
  ExpirationColumn({ expired: true }),
  ActionColumn(),
];

const CompetitionsList = ({ competitions, expiredCompetitions, isLoading, upcoming }) =>
  competitions.length + upcoming.length + expiredCompetitions.length > 0 ? (
    <>
      <h1>
        <Trans i18nKey="settings.competitions.header">Competitions</Trans>
      </h1>
      {upcoming.length > 0 && (
        <div className="section">
          <h4>
            <Trans i18nKey="settings.competitions.list.upcoming">Upcoming</Trans>
          </h4>
          <Table
            columns={columnsUpcoming}
            dataSource={upcoming}
            id="competitions-active"
            pageSize={14}
            rowKey="competitionId"
          />
        </div>
      )}
      {competitions.length > 0 && (
        <div className="section">
          <h4>
            <Trans i18nKey="settings.competitions.list.active">Active</Trans>
          </h4>
          <Table
            columns={columnsActive}
            dataSource={competitions}
            id="competitions-active"
            pageSize={14}
            rowKey="competitionId"
          />
        </div>
      )}
      {expiredCompetitions.length > 0 && (
        <div className="section competitions-table-expired">
          <h4>
            <Trans i18nKey="settings.competitions.list.completed">Completed</Trans>
          </h4>
          <Table
            columns={columnsExpired}
            dataSource={expiredCompetitions}
            id="competitions-expired"
            pageSize={14}
            rowKey="competitionId"
          />
        </div>
      )}
    </>
  ) : (
    <Spin spinning={isLoading}>
      <h1>
        <Trans i18nKey="settings.competitions.header">Competitions</Trans>
      </h1>
      {!isLoading && (
        <div className="section">
          <Trans i18nKey="settings.competitions.list.empty">
            You have not joined any competitions. Enter a competition code below to join, or create
            your own competition and invite traders with the competition code generated.
          </Trans>
        </div>
      )}
    </Spin>
  );

CompetitionsList.propTypes = {
  competitions: PropTypes.array.isRequired,
  expiredCompetitions: PropTypes.array.isRequired,
};

export default memo(CompetitionsList);
