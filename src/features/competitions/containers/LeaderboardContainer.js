import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { connectSpinner } from '../../../common/services/spinner';

import {
  clearLeaderboardActions,
  fetchLeaderboardActions,
  selectContracts,
  selectLeaderboard,
} from '../ducks';
import { apiCallIds } from '../api';
import Leaderboard from '../components/Leaderboard';

const EnhancedLeaderboard = connectSpinner({
  isLoading: apiCallIds.GET_LEADERBOARD,
})(Leaderboard);

const mapStateToProps = state => ({
  contracts: selectContracts(state),
  leaderboard: selectLeaderboard(state),
});

const mapDispatchToProps = {
  clearLeaderboard: clearLeaderboardActions,
  fetchLeaderboard: fetchLeaderboardActions.request,
};

class LeaderboardContainer extends Component {
  static propTypes = {
    leaderboard: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]).isRequired,
    contracts: PropTypes.array.isRequired,
  };

  componentDidMount() {
    this.props.fetchLeaderboard();
  }

  componentWillUnmount() {
    this.props.clearLeaderboard();
  }

  render() {
    const { contracts, leaderboard } = this.props;

    return <EnhancedLeaderboard contracts={contracts} leaderboard={leaderboard} />;
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LeaderboardContainer));
