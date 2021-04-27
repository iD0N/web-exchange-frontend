import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { connectSpinner, finishApiCall, startApiCall } from '../../../../common/services/spinner';
import { IsMobile } from '../../../../common/components';
import TradeModeProvider from '../trade-mode'; // TODO uplift
import { WS_CHANNELS } from '../../constants';
import ContractSubscription from '../../ws-subscription/containers/ContractSubscription';

import {
  apiCallIds,
  selectOrderBookContract,
  selectTradeEnabled,
  toggleTradeEnabledAction,
} from './ducks';
import OrderBook from './components/OrderBook';

const EnhancedOrderBook = connectSpinner({
  isLoading: apiCallIds.FETCH_ORDER_BOOK,
})(OrderBook);

const mapStateToProps = (state, { contractCode }) => ({
  tradeEnabled: selectTradeEnabled(state),
  contract: selectOrderBookContract(state),
});

const mapDispatchToProps = {
  finishApiCall,
  startApiCall,
  toggleTradeMode: toggleTradeEnabledAction,
};

class OrderBookContainer extends Component {
  static propTypes = {
    contract: PropTypes.object.isRequired,
    isMobile: PropTypes.bool.isRequired,
    finishApiCall: PropTypes.func.isRequired,
    startApiCall: PropTypes.func.isRequired,
    tradeEnabled: PropTypes.bool.isRequired,
  };

  componentDidMount() {
    const { isMobile, tradeEnabled, toggleTradeMode } = this.props;

    if (isMobile && tradeEnabled) {
      toggleTradeMode();
    }
  }

  componentDidUpdate({ contract: { contractCode: prevContractCode }, isMobile: wasMobile }) {
    const {
      contract: { contractCode },
      isMobile,
      finishApiCall,
      startApiCall,
      toggleTradeMode,
      tradeEnabled,
    } = this.props;

    if (!wasMobile && isMobile && tradeEnabled) {
      toggleTradeMode();
    }

    if (contractCode !== prevContractCode) {
      finishApiCall({ apiCallId: apiCallIds.FETCH_ORDER_BOOK });
      startApiCall({ apiCallId: apiCallIds.FETCH_ORDER_BOOK });
    }
  }

  componentWillUnmount() {
    this.props.tradeEnabled && this.props.toggleTradeMode();
  }

  render() {
    const { contract, toggleTradeMode, tradeEnabled } = this.props;

    return (
      <ContractSubscription channel={WS_CHANNELS.LEVEL2} contractCodes={[contract.contractCode]}>
        <TradeModeProvider
          contract={contract}
          classPrefix="orderbook"
          showOrderTypeRadio
          widget="order-book"
        >
          <EnhancedOrderBook tradeEnabled={tradeEnabled} toggleTradeMode={toggleTradeMode} />
        </TradeModeProvider>
      </ContractSubscription>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(IsMobile(OrderBookContainer));
