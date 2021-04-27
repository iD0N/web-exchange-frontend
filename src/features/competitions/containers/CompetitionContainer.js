import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { selectAccountTraderId } from '../../../common/services/accounts';
import { fetchAffiliateAction, selectAffiliate } from '../../../common/services/user';
import { connectSpinner } from '../../../common/services/spinner';
import {
  clearCompetitionAction,
  fetchCompetitionActions,
  fetchCompetitionsActions,
  selectCompetitionCode,
  selectCompetition,
  selectIsCreator,
} from '../../settings/components/competitions/ducks';
import { apiCallIds } from '../../settings/components/competitions/api';

import { NO_CONTRACT_VALUE, selectApplicableContracts } from '../ducks';
import Competition from '../components/Competition';

const EnhancedCompetition = connectSpinner({
  isLoading: apiCallIds.GET_COMPETITION,
  isLoadingList: apiCallIds.GET_COMPETITIONS,
})(Competition);

const mapStateToProps = state => ({
  affiliate: selectAffiliate(state),
  contracts: selectApplicableContracts(state),
  isLoggedIn: !!selectAccountTraderId(state),
  competition: selectCompetition(state),
  competitionCode: selectCompetitionCode(state),
  isCreator: selectIsCreator(state),
});

const mapDispatchToProps = {
  clearCompetition: clearCompetitionAction,
  fetchCompetition: fetchCompetitionActions.request,
  fetchCompetitions: fetchCompetitionsActions.request,
  fetchAffiliate: fetchAffiliateAction.request,
};

class CompetitionContainer extends Component {
  static propTypes = {
    competition: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]).isRequired,
    fetchCompetition: PropTypes.func.isRequired,
    fetchCompetitions: PropTypes.func.isRequired,
  };

  state = {
    contractCode: NO_CONTRACT_VALUE,
  };

  componentDidMount() {
    const competitionId = this.getCompetitionId();

    if (competitionId) {
      this.props.fetchCompetition({
        competitionId,
        contractCode: this.state.contractCode !== NO_CONTRACT_VALUE && this.state.contractCode,
      });
    } else {
      this.redirectToTrader();
      return;
    }

    if (this.props.competitionCode && !this.props.affiliate) {
      this.props.fetchAffiliate();
    }
  }

  componentDidUpdate(
    {
      competition: prevCompetition,
      competitionCode: prevCode,
      contracts: prevContracts,
      isLoggedIn: wasLoggedIn,
    },
    { contractCode: prevContractCode }
  ) {
    const { competition, competitionCode, contracts, isLoggedIn } = this.props;
    const { contractCode } = this.state;

    if (!prevCompetition && competition && !competition.competitionId) {
      this.redirectToTrader();
      return;
    }

    if (prevContracts.length !== contracts.length) {
      this.setState({ contractCode: contracts[0].value });
    }

    if (
      competition &&
      competition.competitionId &&
      (competition.competitionId !== this.getCompetitionId() || prevContractCode !== contractCode)
    ) {
      this.props.fetchCompetition({
        competitionId: this.getCompetitionId(),
        contractCode: contractCode !== NO_CONTRACT_VALUE && contractCode,
      });
      if (this.props.competitionCode && !this.props.affiliate) {
        this.props.fetchAffiliate();
      }
    }

    if (!wasLoggedIn && isLoggedIn) {
      this.props.fetchCompetitions();
    }

    if (!prevCode && competitionCode && !this.props.affiliate) {
      this.props.fetchAffiliate();
    }
  }

  componentWillUnmount() {
    this.props.clearCompetition();
  }

  getCompetitionId = () => this.props.match.params.competitionId;

  setContractCode = contractCode => this.setState({ contractCode });

  redirectToTrader = () => this.props.history.push('/trader');

  render() {
    const {
      affiliate,
      competition,
      competitionCode,
      contracts,
      fetchCompetition,
      isCreator,
    } = this.props;
    const { contractCode } = this.state;

    return (
      <EnhancedCompetition
        competitionCode={competitionCode}
        competition={this.getCompetitionId() === competition.competitionId ? competition : {}}
        contractCode={this.state.contractCode}
        handleContractCodeChange={this.setContractCode}
        contracts={contracts}
        fetchCompetition={() =>
          fetchCompetition({
            competitionId: competition.competitionId,
            contractCode: contractCode !== NO_CONTRACT_VALUE && contractCode,
          })
        }
        affiliate={affiliate ? affiliate.referralCode : false}
        isCreator={isCreator}
      />
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CompetitionContainer));
