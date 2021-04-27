import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans, translate } from 'react-i18next';
import cn from 'classnames';

import AlertService from '../../../../../common/services/alert';
import { Form, Input, Spin } from '../../../../../common/components';
import rules from '../../../../../common/rules';
import { Button, InfoTooltip } from '../../../../../common/components/trader';

class LeaderboardName extends Component {
  static propTypes = {
    isUpdatingName: PropTypes.bool,
    t: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      leaderboardName: this.props.leaderboardName,
    };
  }

  componentDidUpdate({ leaderboardName: prevLeaderboardName }) {
    const { leaderboardName } = this.props;

    if (prevLeaderboardName !== leaderboardName) {
      this.setState({ leaderboardName });
    }
  }

  handleNameChange = ({ target: { value: leaderboardName } }) => this.setState({ leaderboardName });

  handleUpdateAlias = () => {
    if (this.state.leaderboardName && !!this.state.leaderboardName.trim()) {
      if (this.state.leaderboardName.trim().length > 100) {
        AlertService.error(
          this.props.t('settings.competitions.leaderboardName.error', {
            defaultValue: 'Leaderboard names cannot be longer than 100 characters.',
          })
        );
      } else if (this.state.leaderboardName.trim().length < 3) {
        AlertService.error(
          this.props.t('settings.competitions.leaderboardName.errorMin', {
            defaultValue: 'Leaderboard names must be at least 3 characters long.',
          })
        );
      } else {
        this.props.updateLeaderboardName(this.state.leaderboardName);
      }
    }
  };

  render() {
    const { isUpdatingName, t } = this.props;

    return (
      <div className={cn('section', { 'empty-leaderboard-name': !this.props.leaderboardName })}>
        <Spin spinning={isUpdatingName}>
          <InfoTooltip title={<Trans i18nKey="settings.competitions.leaderboardName.tooltip" />}>
            <h4>
              <Trans i18nKey="settings.competitions.leaderboardName.header">Leaderboard Name</Trans>
            </h4>
          </InfoTooltip>
          <Form.Item
            id="leaderboardName"
            rules={[rules.alias]}
            required
            label={
              <Trans i18nKey="settings.competitions.leaderboardName.placeholder">
                Your Leaderboard Name
              </Trans>
            }
          >
            <Input
              id="leaderboardName"
              value={this.state.leaderboardName}
              onChange={this.handleNameChange}
              placeholder={t('settings.competitions.leaderboardName.description', {
                defaultValue: 'Pick a name to display on leaderboards',
              })}
              suffix={
                <Button
                  block
                  type="ghost"
                  size="small"
                  disabled={
                    !this.state.leaderboardName ||
                    this.props.leaderboardName === this.state.leaderboardName ||
                    isUpdatingName
                  }
                  onClick={this.handleUpdateAlias}
                >
                  {isUpdatingName ? (
                    <Trans i18nKey="settings.competitions.leaderboardName.buttonPending">
                      Updating Leaderboard Name...
                    </Trans>
                  ) : (
                    <Trans i18nKey="settings.competitions.leaderboardName.button">
                      Update Leaderboard Name
                    </Trans>
                  )}
                </Button>
              }
            />
          </Form.Item>
        </Spin>
      </div>
    );
  }
}

export default translate()(LeaderboardName);
