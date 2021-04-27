import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans, translate } from 'react-i18next';

import { Form, Input, Spin } from '../../../../../common/components';
import { Button } from '../../../../../common/components/trader';

class JoinCompetition extends Component {
  static propTypes = {
    isJoining: PropTypes.bool,
    joinCompetition: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      code: null,
    };
  }

  handleJoinCompetition = () => {
    const { code } = this.state;
    this.setState(
      {
        code: null,
      },
      () => this.props.joinCompetition({ code })
    );
  };

  handleCodeChange = ({ target: { value: code } }) => this.setState({ code });

  render() {
    const { isJoining, leaderboardName, t } = this.props;

    return (
      <div className="section code-section">
        <Spin spinning={isJoining}>
          <h1>
            <Trans i18nKey="settings.competitions.join.header">Join a Trading Competition</Trans>
          </h1>
          <div className="section" style={{ marginBottom: 15 }}>
            <Trans i18nKey="settings.competitions.join.description">
              Enter the competition code provided to you by a competition organizer to join a
              competition.
            </Trans>
          </div>
          <h4>
            <Trans i18nKey="settings.competitions.create.field.code">Join Code</Trans>
          </h4>
          <Form.Item
            id="competitionCode"
            label={<Trans i18nKey="settings.competitions.create.field.code">Join Code</Trans>}
          >
            <Input
              id="competitionCode"
              value={this.state.code}
              onChange={this.handleCodeChange}
              placeholder={t('settings.competitions.join.label.code', {
                defaultValue: 'Enter your competition code',
              })}
            />
          </Form.Item>
          <Button
            block
            type="ghost"
            size="medium"
            onClick={() => {
              if (!leaderboardName || !this.state.code || isJoining) {
                return;
              }
              this.handleJoinCompetition();
            }}
          >
            {isJoining ? (
              <Trans i18nKey="settings.competitions.join.buttonPending">Joining...</Trans>
            ) : (
              <Trans i18nKey="settings.competitions.join.button">Join Competition</Trans>
            )}
          </Button>
          {this.state.code && !leaderboardName && (
            <div className="name-prompt">
              <Trans i18nKey="settings.competitions.namePrompt" />
            </div>
          )}
        </Spin>
      </div>
    );
  }
}

export default translate()(JoinCompetition);
