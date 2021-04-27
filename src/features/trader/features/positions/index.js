import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';

import { CONTRACT_TYPE } from '../../../../common/enums';
import { connectSpinner } from '../../../../common/services/spinner';
import { apiCallIds as accountsApiCallIds } from '../../../../common/services/accounts/api';
import { connectKeyValueStore } from '../../../../common/services/keyValueStore';
import { WS_CHANNELS } from '../../constants';
import ChannelSubscription from '../../ws-subscription/containers/ChannelSubscription';

import { selectGlobalContract } from '../../data-store/ducks';
import { apiCallIds } from './ducks';
import Positions from './components/Positions';

const POSITIONS_WIDGET_CONFIG_VALUE_KEY = 'positionsWidgetConfig';

const widgetConfigInitialValue = {
  tableConfig: {},
};

const EnhancedPositions = connectSpinner({
  isRebalancingUsd: accountsApiCallIds.REBALANCE_USD,
  isLoading: apiCallIds.FETCH_POSITIONS,
  isLoadingConfig: apiCallIds.FETCH_POSITIONS_WIDGET_CONFIG,
})(Positions);

const mapStateToProps = (state, props) => ({
  globalContract: selectGlobalContract(state),
  widgetConfig: props[POSITIONS_WIDGET_CONFIG_VALUE_KEY],
});

class PositionsContainer extends Component {
  static propTypes = {
    widgetConfig: PropTypes.object.isRequired,
    getValue: PropTypes.func.isRequired,
    setValue: PropTypes.func.isRequired,
  };

  static defaultProps = {
    widgetConfig: {},
  };

  state = {
    key: 1,
  };

  componentDidMount() {
    this.props.getValue(
      {
        apiCallId: apiCallIds.FETCH_POSITIONS_WIDGET_CONFIG,
      },
      widgetConfigInitialValue
    );

    const msToMidnight =
      moment()
        .add(1, 'days')
        .startOf('day')
        .utc()
        .diff(moment()) +
      1000 * 5;
    this.midnightReset = setTimeout(this.handleMidnightReset, msToMidnight);
  }

  componentWillUnmount() {
    clearTimeout(this.midnightReset);
  }

  handleMidnightReset = () => {
    this.setState({ key: this.state.key + 1 });
  };

  handleTableConfigChange = tableConfig => {
    this.props.setValue({
      ...this.props.widgetConfig,
      tableConfig,
    });
  };

  handleWidgetConfigReset = () => this.props.setValue(widgetConfigInitialValue);

  render() {
    const { globalContract, widgetConfig } = this.props;

    return (
      <ChannelSubscription
        channel={WS_CHANNELS.POSITIONS}
        forceResubscribe={this.state.key > 1}
        key={this.state.key}
      >
        <EnhancedPositions
          highlightedTokenCodes={
            globalContract.type === CONTRACT_TYPE.SPOT
              ? [globalContract.underlying, globalContract.quoteCurrency]
              : undefined
          }
          globalContractIsSpot={globalContract.type === CONTRACT_TYPE.SPOT}
          widgetConfig={widgetConfig}
          onTableConfigChange={this.handleTableConfigChange}
          onWidgetConfigReset={this.handleWidgetConfigReset}
        />
      </ChannelSubscription>
    );
  }
}

export default connectKeyValueStore(POSITIONS_WIDGET_CONFIG_VALUE_KEY)(
  connect(mapStateToProps)(PositionsContainer)
);
