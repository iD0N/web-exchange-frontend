import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { selectChartData } from '../..//ducks';

const mapStateToProps = state => ({
  chartData: selectChartData(state, []),
});

class TickerSeries extends PureComponent {
  static propTypes = {
    chartData: PropTypes.object.isRequired,
  };

  updateChartData(data, updateJustIndex) {
    const { globalContractCode, resolution, updater } = this.props;
    if (!updateJustIndex && updater[globalContractCode]) {
      const bar = updater[globalContractCode].getUpdatedLastBar(
        globalContractCode,
        data,
        resolution
      );
      updater[globalContractCode].onRealtimeCallback(bar);
    }

    const indexStr = `.${globalContractCode}`;

    if (updater[indexStr]) {
      const indexBar = updater[indexStr].getUpdatedLastBar(indexStr, data, resolution, true);
      updater[indexStr].onRealtimeCallback(indexBar);
    }
  }

  componentDidUpdate({ chartData: lastChartData, globalContractCode: prevContractCode }) {
    const { chartData, globalContractCode, updater } = this.props;

    if (updater[globalContractCode] && chartData && !lastChartData !== chartData) {
      const currentContractData = chartData[globalContractCode];
      if (currentContractData && currentContractData.Last) {
        if (
          (!lastChartData ||
            !lastChartData[globalContractCode] ||
            lastChartData[globalContractCode].Last !== currentContractData.Last) &&
          currentContractData.DT
        ) {
          this.updateChartData(currentContractData);
        } else if (lastChartData[globalContractCode].IDT !== currentContractData.IDT) {
          this.updateChartData(currentContractData, true);
        }
      }
    }
  }

  render() {
    return null;
  }
}

export default connect(mapStateToProps)(TickerSeries);
