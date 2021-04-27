import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { connectSpinner } from '../../../../common/services/spinner';
import { selectAccountAlias } from '../../../../common/services/accounts';
import { Row, Col, Spin } from '../../../../common/components';

import {
  createCompetitionActions,
  fetchCompetitionsActions,
  joinCompetitionActions,
  selectUpcomingCompetitions,
  selectActiveCompetitions,
  selectCreatedCompetition,
  selectExpiredCompetitions,
  updateLeaderboardNameAction,
} from './ducks';
import { apiCallIds } from './api';
import CompetitionsLists from './components/CompetitionsLists';
import JoinCompetition from './components/JoinCompetition';
import CreateCompetition from './components/CreateCompetition';
import LeaderboardName from './components/LeaderboardName';

const EnhancedCompetitionsLists = connectSpinner({
  isLoading: apiCallIds.GET_COMPETITIONS,
})(CompetitionsLists);

const EnhancedJoinCompetition = connectSpinner({
  isJoining: apiCallIds.JOIN_COMPETITION,
})(JoinCompetition);

const EnhancedCreateCompetition = connectSpinner({
  isCreating: apiCallIds.CREATE_COMPETITION,
})(CreateCompetition);

const EnhancedLeaderboardName = connectSpinner({
  isUpdatingName: apiCallIds.UPDATE_ACCOUNT_ALIAS,
})(LeaderboardName);

const mapStateToProps = (state, props) => ({
  upcomingCompetitions: selectUpcomingCompetitions(state),
  competitions: selectActiveCompetitions(state),
  expiredCompetitions: selectExpiredCompetitions(state),
  leaderboardName: selectAccountAlias(state),
  createdCompetition: selectCreatedCompetition(state),
});

const mapDispatchToProps = {
  fetchCompetitions: fetchCompetitionsActions.request,
  joinCompetition: joinCompetitionActions.request,
  createCompetition: createCompetitionActions.request,
  updateLeaderboardName: updateLeaderboardNameAction,
};

class CompetitionsContainer extends Component {
  static propTypes = {
    fetchCompetitions: PropTypes.func.isRequired,
    isJoining: PropTypes.bool,
    isLoading: PropTypes.bool,
    isMobile: PropTypes.bool,
    joinCompetition: PropTypes.func.isRequired,
    createCompetition: PropTypes.func.isRequired,
    competitions: PropTypes.array.isRequired,
    expiredCompetitions: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      code: null,
    };
  }

  componentDidMount() {
    this.props.fetchCompetitions();
  }

  componentDidUpdate({ competitions: prevCompetitions }) {
    const { competitions } = this.props;

    if (prevCompetitions && prevCompetitions.length !== competitions.length) {
      // clear the input because this means they successfully joined
      this.setState({
        code: null,
      });
    }
  }

  handleJoinCompetition = () => this.props.joinCompetition({ code: this.state.code });

  handleCodeChange = ({ target: { value: code } }) => this.setState({ code });

  render() {
    const {
      isLoading,
      isMobile,
      competitions,
      expiredCompetitions,
      leaderboardName,
      updateLeaderboardName,
      joinCompetition,
      createCompetition,
      createdCompetition,
      upcomingCompetitions,
    } = this.props;

    return (
      <Spin spinning={isLoading}>
        <Row className="settings-competitions-wrapper">
          <Col span={isMobile ? 24 : 14}>
            <EnhancedCompetitionsLists
              competitions={competitions}
              expiredCompetitions={expiredCompetitions}
              upcoming={upcomingCompetitions}
            />
            <EnhancedLeaderboardName
              leaderboardName={leaderboardName}
              updateLeaderboardName={updateLeaderboardName}
            />
            <EnhancedCreateCompetition
              createCompetition={createCompetition}
              leaderboardName={leaderboardName}
              createdCompetition={createdCompetition}
            />
            <EnhancedJoinCompetition
              joinCompetition={joinCompetition}
              leaderboardName={leaderboardName}
            />
          </Col>
        </Row>
      </Spin>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CompetitionsContainer);
