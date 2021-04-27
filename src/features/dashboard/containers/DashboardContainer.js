import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FeatureFlag } from 'react-launch-darkly';

import { connectSpinner } from '../../../common/services/spinner';
import ContractSubscription from '../../trader/ws-subscription/containers/ContractSubscription';
import { WS_CHANNELS } from '../../trader/constants';

import { clearSummaryActions, fetchSummaryActions, selectSummaryWithMetadata } from '../ducks';
import { apiCallIds } from '../api';

import Dashboard from '../components/Dashboard';

const EnhancedDashboard = connectSpinner({
  isLoading: apiCallIds.GET_SUMMARY,
})(Dashboard);

const mapStateToProps = state => ({
  summary: selectSummaryWithMetadata(state),
});

const mapDispatchToProps = {
  clearSummary: clearSummaryActions,
  fetchSummary: fetchSummaryActions.request,
};

class DashboardContainer extends Component {
  static propTypes = {};

  componentDidMount() {
    this.props.fetchSummary();
  }

  componentWillUnmount() {
    this.props.clearSummary();
  }

  render() {
    const { summary } = this.props;

    return (
      <ContractSubscription
        channel={WS_CHANNELS.TICKER}
        contractCodes={summary.map(({ contractCode }) => contractCode)}
      >
        <div className="settings-subpage-wrapper dashboard-wrapper">
          <FeatureFlag
            flagKey="operations-market-closed"
            renderFeatureCallback={outages => (
              <EnhancedDashboard outages={outages} summary={summary} />
            )}
          />
        </div>
      </ContractSubscription>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardContainer);
