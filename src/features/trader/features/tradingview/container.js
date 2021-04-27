import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';

import { Spin } from '../../../../common/components';
import { GridLayoutTile, WidgetHeader } from '../../components';
import { selectAccountsLoaded } from '../../../../common/services/accounts';
import { selectIsLoggedIn } from '../../../../common/services/user';
import {
  selectContracts,
  selectGlobalContract,
  setGlobalContractAction,
} from '../../data-store/ducks';
import TradeModeProvider from '../trade-mode'; // TODO uplift
import { TradeModeConsumer } from '../trade-mode/Context'; // TODO uplift

import { fetchConfigAction, changeConfigAction, selectChartConfig } from './ducks';
import TradeViewChartContainer from './';

const mapStateToProps = (state, props) => ({
  config: selectChartConfig(state),
  contractsMetadata: selectContracts(state),
  globalContract: selectGlobalContract(state),
  isLoggedIn: selectAccountsLoaded(state) && selectIsLoggedIn(state),
  needsLogin: selectIsLoggedIn(state),
});

const mapDispatchToProps = {
  fetchConfig: fetchConfigAction,
  changeConfig: changeConfigAction,
  setGlobalContract: setGlobalContractAction,
};

class ChartWidget extends Component {
  static propTypes = {
    changeConfig: PropTypes.func.isRequired,
    config: PropTypes.object,
    contractsMetadata: PropTypes.object.isRequired,
    fetchConfig: PropTypes.func.isRequired,
    globalContract: PropTypes.object.isRequired,
    isFetchingConfig: PropTypes.bool.isRequired,
    setGlobalContract: PropTypes.func,
  };

  static defaultProps = {
    isFetchingConfig: false,
  };

  componentDidMount() {
    this.props.fetchConfig();
  }

  handleConfigChange = newConfig => {
    const { config, changeConfig } = this.props;

    changeConfig({ ...config, ...newConfig });
  };

  handleTradeModeToggle = tradeModeEnabled => {
    this.handleConfigChange({ tradeModeEnabled });
  };

  render() {
    const {
      changeConfig,
      config,
      contractsMetadata,
      globalContract,
      isLoggedIn,
      setGlobalContract,
      needsLogin,
    } = this.props;

    return !config || needsLogin !== isLoggedIn ? (
      <Spin spinning>
        <GridLayoutTile
          title={<WidgetHeader title={<Trans i18nKey="trader.chart.title">Chart</Trans>} />}
        />
      </Spin>
    ) : (
      <TradeModeProvider
        defaultEnabled={config.tradeModeEnabled}
        contract={globalContract}
        classPrefix="chart"
        widget="chart"
        onToggle={this.handleTradeModeToggle}
      >
        <TradeModeConsumer>
          {({ tradeEnabled }) => (
            <TradeViewChartContainer
              changeConfig={changeConfig}
              config={config}
              contractsMetadata={contractsMetadata}
              globalContract={globalContract}
              isLoggedIn={isLoggedIn}
              setGlobalContract={setGlobalContract}
              tradeEnabled={tradeEnabled}
            />
          )}
        </TradeModeConsumer>
      </TradeModeProvider>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChartWidget);
