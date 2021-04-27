import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans, translate } from 'react-i18next';
import moment from 'moment';
import urlSlug from 'url-slug';

import { Form, Input, Spin } from '../../../../../common/components';
import { Button, Checkbox } from '../../../../../common/components/trader';

const getHostname = () => {
  const { hostname } = window.location;
  return hostname === 'localhost' ? 'http://localhost:3000' : 'https://' + hostname;
};

const PostJoinSection = ({ code, label, competitionId }) => (
  <div className="post-create-section">
    <div>
      <Trans i18nKey="settings.competitions.create.afterCreate">
        Congratulations on creating your trading competition! Traders can join your competition by
        visiting the join link below, or by entering your competition invite code on this page.
      </Trans>
    </div>
    <div className="post-create-code">
      <h4>
        <Trans i18nKey="settings.competitions.create.field.url">Public URL</Trans>
      </h4>
      <div className="auto-select-all">
        <b>
          {getHostname()}/competition/{competitionId}
        </b>
      </div>
      <h4>
        <Trans i18nKey="settings.competitions.create.field.joinLink">Join link</Trans>
      </h4>
      <div className="auto-select-all">
        <b>
          {getHostname()}/compete/{code}
        </b>
      </div>
      <h4>
        <Trans i18nKey="settings.competitions.create.field.code">Join Code</Trans>
      </h4>
      <div>
        <b className="auto-select-all">{code}</b>
      </div>
    </div>
  </div>
);

class CreateCompetition extends Component {
  static propTypes = {
    isCreating: PropTypes.bool,
    createCompetition: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      autoJoin: true,
      label: null,
      slug: null,
      code: null,
      startDate: moment()
        .add(moment().utcOffset(), 'minutes')
        .startOf('hour')
        .add(1, 'hour')
        .toISOString()
        .slice(0, -1),
      endDate: moment()
        .add(moment().utcOffset(), 'minutes')
        .startOf('hour')
        .add(1, 'hour')
        .add(7, 'days')
        .toISOString()
        .slice(0, -1),
      didCreate: false,
      isPublic: true,
    };
  }

  componentDidMount() {
    this.setState({ didCreate: false });
  }

  componentDidUpdate({ createdCompetition }) {
    if (!createdCompetition && this.props.createdCompetition) {
      // clear the input because this means they successfully joined
      this.setState({
        autoJoin: true,
        label: null,
        code: null,
        slug: null,
        startDate: null,
        endDate: null,
        didCreate: true,
        isPublic: true,
      });
    }
  }

  handleCreateCompetition = () => {
    const { autoJoin, code, endDate, isPublic, label, slug, startDate } = this.state;
    this.props.createCompetition({ autoJoin, code, endDate, isPublic, label, slug, startDate });
  };

  handleValueChange = field => ({ target: { value } }) => this.setState({ [field]: value });

  render() {
    const { isCreating, leaderboardName, t, createdCompetition } = this.props;

    return (
      <div className="section create-section">
        {!this.state.didCreate || !createdCompetition ? (
          <Spin spinning={isCreating}>
            <h1>
              <Trans i18nKey="settings.competitions.create.header">
                Start a Trading Competition
              </Trans>
            </h1>
            <div className="section">
              <Trans i18nKey="settings.competitions.create.description">
                Start a competition to compete and compare performance against fellow traders. When
                a trader joins Crypto through your competition join link, you will earn a percentage
                of your referred traders' trading fees.
              </Trans>
            </div>
            <h4>
              <Trans i18nKey="settings.competitions.create.field.name">Competition Name</Trans>
            </h4>
            <Form.Item
              id="competitionLabel"
              label={
                <Trans i18nKey="settings.competitions.create.field.name">Competition Name</Trans>
              }
            >
              <Input
                id="competitionLabel"
                value={this.state.label}
                onChange={this.handleValueChange('label')}
                placeholder={t('settings.competitions.create.label.name', {
                  defaultValue: 'Give your competition a name',
                })}
              />
            </Form.Item>
            <h4>
              <Trans i18nKey="settings.competitions.create.field.url">Public URL</Trans>{' '}
              <span className="optional">
                (<Trans i18nKey="fields.optional">optional</Trans>)
              </span>
              <span className="slug">
                {getHostname()}/competition/
                {this.state.slug ? urlSlug(this.state.slug) : 'url-path'}
              </span>
            </h4>
            <Form.Item
              id="competitionPath"
              label={<Trans i18nKey="settings.competitions.create.field.url">Public URL</Trans>}
            >
              <Input
                id="competitionPath"
                value={this.state.slug}
                onChange={this.handleValueChange('slug')}
                placeholder={t('settings.competitions.create.label.slug', {
                  defaultValue: 'URL path for this competition',
                })}
              />
            </Form.Item>
            <h4>
              <Trans i18nKey="settings.competitions.create.field.code">Join Code</Trans>{' '}
              <span className="optional">
                (<Trans i18nKey="fields.optional">optional</Trans>)
              </span>
            </h4>
            <Form.Item
              id="competitionCode"
              label={<Trans i18nKey="settings.competitions.create.field.code">Join Code</Trans>}
            >
              <Input
                id="competitionCode"
                value={this.state.code}
                onChange={this.handleValueChange('code')}
                placeholder={t('settings.competitions.create.label.code', {
                  defaultValue: 'Custom code used to join this competition',
                })}
              />
            </Form.Item>
            <h4>
              <Trans i18nKey="settings.competitions.create.field.startDate">
                Competition Start
              </Trans>{' '}
              <span className="optional">
                (<Trans i18nKey="settings.competitions.create.label.localTime" />)
              </span>
            </h4>
            <Form.Item
              id="competitionStartDate"
              label={
                <Trans i18nKey="settings.competitions.create.field.startDate">
                  Competition Start
                </Trans>
              }
            >
              <Input
                id="competitionStartDate"
                value={this.state.startDate}
                onChange={this.handleValueChange('startDate')}
                placeholder={t('settings.competitions.create.label.startDate', {
                  defaultValue: 'Time this competition starts',
                })}
              />
            </Form.Item>
            <h4>
              <Trans i18nKey="settings.competitions.create.field.endDate">Competition End</Trans>{' '}
              <span className="optional">
                (<Trans i18nKey="settings.competitions.create.label.localTime" />)
              </span>
            </h4>
            <Form.Item
              id="competitionEndDate"
              label={
                <Trans i18nKey="settings.competitions.create.field.endDate">Competition End</Trans>
              }
            >
              <Input
                id="competitionEndDate"
                value={this.state.endDate}
                onChange={this.handleValueChange('endDate')}
                placeholder={t('settings.competitions.create.label.endDate', {
                  defaultValue: 'Time this competition ends',
                })}
              />
            </Form.Item>
            <div className="autojoin-checkbox">
              <Checkbox
                checked={this.state.isPublic}
                onChange={() => {
                  this.setState({ isPublic: !this.state.isPublic });
                }}
              >
                <Trans i18nKey="settings.competitions.create.label.isPublic">
                  Permit this competition to be listed publicly and allow anyone to join from the
                  leaderboard page.
                </Trans>
              </Checkbox>
            </div>
            <div className="autojoin-checkbox">
              <Checkbox
                checked={this.state.autoJoin}
                onChange={() => {
                  this.setState({ autoJoin: !this.state.autoJoin });
                }}
              >
                <Trans i18nKey="settings.competitions.create.label.autoJoin">
                  Auto-join this competition upon creation.
                </Trans>
              </Checkbox>
            </div>
            <Button
              block
              type="primary"
              size="medium"
              onClick={() =>
                !(!leaderboardName || !this.state.label || isCreating) &&
                this.handleCreateCompetition()
              }
            >
              {isCreating ? (
                <Trans i18nKey="settings.competitions.create.buttonPending">Creating...</Trans>
              ) : (
                <Trans i18nKey="settings.competitions.create.button">Create Competition</Trans>
              )}
            </Button>
            {this.state.label && !leaderboardName && (
              <div className="name-prompt">
                <Trans i18nKey="settings.competitions.namePrompt">
                  You must choose a leaderboard name before creating a competition. This name will
                  be displayed next to your rank and performance on competition leaderboards.
                </Trans>
              </div>
            )}
          </Spin>
        ) : (
          <PostJoinSection {...createdCompetition} />
        )}
      </div>
    );
  }
}

export default translate()(CreateCompetition);
