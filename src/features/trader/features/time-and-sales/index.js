import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { connectSpinner } from '../../../../common/services/spinner';
import { selectGlobalContract } from '../../data-store/ducks';

import {
  fetchAuctionsActions,
  clearContractDataAction,
  updateMinTradeSizeAction,
  selectFilteredTimeAndSales,
  selectMinTradeSize,
} from './ducks';
import { apiCallIds } from './api';
import TimeAndSales from './components/TimeAndSales';

const EnhancedTimeAndSales = connectSpinner({
  isLoading: apiCallIds.FETCH_AUCTIONS,
})(TimeAndSales);

const mapStateToProps = state => ({
  timeAndSales: selectFilteredTimeAndSales(state),
  minTradeSize: selectMinTradeSize(state),
  globalContract: selectGlobalContract(state),
});

const mapDispatchToProps = {
  fetchContractAuctions: fetchAuctionsActions.request,
  clearContractData: clearContractDataAction,
  updateMinTradeSize: updateMinTradeSizeAction,
};

class TimeAndSalesContainer extends Component {
  static propTypes = {
    timeAndSales: PropTypes.array.isRequired,
    globalContract: PropTypes.object.isRequired,
    fetchContractAuctions: PropTypes.func.isRequired,
    clearContractData: PropTypes.func.isRequired,
    updateMinTradeSize: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const {
      minTradeSize,
      globalContract: { contractCode },
      fetchContractAuctions,
    } = this.props;

    fetchContractAuctions({ contractCode, minTradeSize });
  }

  componentDidUpdate({
    minTradeSize: prevMinTradeSize,
    globalContract: { contractCode: prevContractCode },
  }) {
    const {
      minTradeSize,
      globalContract: { contractCode },
      clearContractData,
      fetchContractAuctions,
    } = this.props;

    if (contractCode !== prevContractCode) {
      clearContractData(prevContractCode);
    }

    if (contractCode !== prevContractCode || minTradeSize !== prevMinTradeSize) {
      fetchContractAuctions({ contractCode, minTradeSize });
    }
  }

  render() {
    const {
      globalContract: { quoteCurrency, underlying },
      timeAndSales,
      minTradeSize,
      updateMinTradeSize,
    } = this.props;

    return (
      <EnhancedTimeAndSales
        timeAndSales={timeAndSales}
        minTradeSize={minTradeSize}
        updateMinTradeSize={updateMinTradeSize}
        quoteCurrency={quoteCurrency}
        underlying={underlying}
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TimeAndSalesContainer);
