import React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Tooltip, Value } from '../../../../common/components/trader';

export const LabelColumn = ({ width = 40 } = {}) => ({
  dataIndex: 'label',
  title: <Trans i18nKey="settings.competitions.column.name">Competition Name</Trans>,
  width,
});

export const InviteColumn = ({ width = 20 } = {}) => ({
  dataIndex: 'code',
  title: <Trans i18nKey="settings.competitions.column.code">Invite Code</Trans>,
  width,
  render: value => <div className="auto-select-all">{value}</div>,
});

export const ExpirationColumn = ({ width = 20, expired } = { expired: false }) => ({
  dataIndex: 'endDate',
  title: expired ? (
    <Trans i18nKey="settings.competitions.column.ended">Ended</Trans>
  ) : (
    <Trans i18nKey="settings.competitions.column.expires">Ends</Trans>
  ),
  render: (value, { expired }) => (
    <Tooltip title={<Value.Date type="datetime" value={value} />}>
      {expired ? (
        <>
          <Value.Duration value={value} /> ago
        </>
      ) : (
        <>
          in <Value.Duration reverted value={value} />
        </>
      )}
    </Tooltip>
  ),
  width,
});
export const BegginingColumn = ({ width = 20, expired } = { expired: false }) => ({
  dataIndex: 'startDate',
  title: <Trans i18nKey="settings.competitions.column.starts">Starts</Trans>,
  render: (value, { expired }) => (
    <Tooltip title={<Value.Date type="datetime" value={value} />}>
      in <Value.Duration reverted value={value} />
    </Tooltip>
  ),
  width,
});

export const ActionColumn = ({ width = 20 } = {}) => ({
  dataIndex: 'competitionId',
  width,
  render: (value, { expired }) => (
    <Link to={`/competition/${value}`}>
      {expired ? (
        <Trans i18nKey="settings.competitions.column.results">Results</Trans>
      ) : (
        <Trans i18nKey="settings.competitions.column.leaderboard">Leaderboard</Trans>
      )}
    </Link>
  ),
});
