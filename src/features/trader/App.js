import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { show } from 'redux-modal';
import BodyClassName from 'react-body-classname';

import { isProd } from '../../config';
import { GlobalSpinner, IsMobile } from '../../common/components';
import { selectAccountsLoaded } from '../../common/services/accounts';
import {
  selectHasStartedKyc,
  selectIsLoggedIn,
  selectHasFundsTransfer,
  selectAcceptedEmxTokenTerms,
  selectIsSAFT,
} from '../../common/services/user';
import { MarkNotificationsReadOnUnload } from '../../common/services/notification';
import { Layout } from '../../common/components/trader';

import {
  selectBtcContractCode,
  selectContractsLoaded,
  selectGlobalContractCode,
  setGlobalContractAction,
  fetchContractsActions,
  openGlobalContractAction,
} from './data-store/ducks';
import NegativeUsdConvertModal from './components/NegativeUsdConvertModal';
import TraderSettingsModal from './components/SettingsModal';
import TokenTermsPrompt, { TOKEN_TERMS_MODAL_ID } from './components/modal/TokenTermsPrompt';
import LayoutManager from './layout-manager';
import { widgetConfigIds } from './layout-manager/widgetConfigs';
import Chart from './features/tradingview/container';
import ContractDetails from './features/contract-details';
import AccountDetails from './features/account-details';
import OrderBook from './features/order-book';
import Orders from './features/orders';
import Positions from './features/positions';
import OrderEntry from './features/order-entry';
import ConfirmOrderModal from './features/order-entry/components/ConfirmOrderModal';
import MobileInfoModal from './features/mobile-info';
import TimeAndSales from './features/time-and-sales';
import { OrderEntryProvider } from './features/order-entry/OrderEntryContext';
import ContractBar from './features/contract-bar';
import { Details } from './features/contract-bar';

import ChannelSubscription from './ws-subscription/containers/ChannelSubscription';
import { Header, Footer, PageTickerTitle, ConnectionStatus } from './components';
import { WS_CHANNELS } from './constants';

const ACDX_BTC = 'ACDX-BTC';

const mapStateToProps = state => ({
  btcContractCode: selectBtcContractCode(state),
  contractsLoaded: selectContractsLoaded(state),
  isLoggedIn: selectAccountsLoaded(state) && selectIsLoggedIn(state),
  startedKYC: isProd() ? selectHasStartedKyc(state) : true,
  passedKYC: isProd() ? selectHasFundsTransfer(state) : true,
  globalContractCode: selectGlobalContractCode(state),
  acceptedEmxTokenTerms: selectAcceptedEmxTokenTerms(state),
  isSaftHolder: selectIsSAFT(state),
});

const mapDispatchToProps = {
  fetchContracts: fetchContractsActions.request,
  openGlobalContract: openGlobalContractAction,
  setGlobalContract: setGlobalContractAction,
  showAcceptACDXTokenTermsModal: props => show(TOKEN_TERMS_MODAL_ID),
};

const widgetConfig = {
  [widgetConfigIds.Chart]: Chart,
  [widgetConfigIds.ContractDetails]: ContractDetails,
  [widgetConfigIds.AccountDetails]: AccountDetails,
  [widgetConfigIds.OrderBook]: OrderBook,
  [widgetConfigIds.Orders]: Orders,
  [widgetConfigIds.TimeAndSales]: TimeAndSales,
  [widgetConfigIds.Positions]: Positions,
  [widgetConfigIds.OrderEntry]: OrderEntry,
};

class TraderApp extends Component {
  static propTypes = {
    contractsLoaded: PropTypes.bool,
    fetchContracts: PropTypes.func.isRequired,
    isMobile: PropTypes.bool.isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({
        contractCode: PropTypes.string,
      }),
    }).isRequired,
    openGlobalContract: PropTypes.func.isRequired,
  };

  componentWillMount() {
    const { contractsLoaded, fetchContracts } = this.props;
    if (!contractsLoaded) {
      fetchContracts();
    }
  }

  componentDidMount() {
    this.checkIfEmxTokenTermsAccepted();
  }

  componentDidUpdate({
    contractsLoaded: prevContractsLoaded,
    hasFunds: hadFunds,
    isLoggedIn: wasLoggedIn,
    globalContractCode: prevGlobalContractCode,
  }) {
    const {
      btcContractCode,
      contractsLoaded,
      fetchContracts,
      globalContractCode,
      isLoggedIn,
      openGlobalContract,
      setGlobalContract,
    } = this.props;

    if (!prevContractsLoaded && contractsLoaded) {
      openGlobalContract(this.props.match.params.contractCode || btcContractCode);
      if (wasLoggedIn && isLoggedIn) {
        this.checkIfEmxTokenTermsAccepted();
      }
    } else if (!globalContractCode) {
      setGlobalContract(btcContractCode);
    }

    if (!wasLoggedIn && isLoggedIn) {
      this.checkIfEmxTokenTermsAccepted();
      fetchContracts();
      return;
    }

    if (prevGlobalContractCode !== ACDX_BTC && this.props.globalContractCode === ACDX_BTC) {
      this.checkIfEmxTokenTermsAccepted();
    }
  }

  checkIfEmxTokenTermsAccepted = () => {
    const {
      isLoggedIn,
      acceptedEmxTokenTerms,
      showAcceptACDXTokenTermsModal,
      globalContractCode,
    } = this.props;

    if (isLoggedIn && !acceptedEmxTokenTerms && globalContractCode === ACDX_BTC) {
      showAcceptACDXTokenTermsModal();
    }
  };

  render() {
    const {
      acceptedEmxTokenTerms,
      isSaftHolder,
      contractsLoaded,
      isMobile,
    } = this.props;

    return (
      <BodyClassName className="trader-screen">
        <>
          <PageTickerTitle />
          <MarkNotificationsReadOnUnload />
          {isMobile && <ConnectionStatus />}
          <GlobalSpinner>
            <Layout>
              <ChannelSubscription channel={WS_CHANNELS.FUNDING}>
                <ChannelSubscription channel={WS_CHANNELS.BALANCES}>
                  <OrderEntryProvider>
                    <Header />
                    {/*isLoggedIn && isMobile && <OrderEntry />*/}
                    {contractsLoaded && (
                      <>
                        <ContractBar />
                        <Details />
                        <Layout.Content>
                          <LayoutManager>{widgetConfig}</LayoutManager>
                        </Layout.Content>
                      </>
                    )}
                    {!isMobile && <Footer />}
                    {isMobile && <MobileInfoModal />}
                  </OrderEntryProvider>
                </ChannelSubscription>
              </ChannelSubscription>
            </Layout>
          </GlobalSpinner>
          <ConfirmOrderModal isMobile={isMobile} />
          <TraderSettingsModal />
          <NegativeUsdConvertModal />
          <TokenTermsPrompt
            isMobile={isMobile}
            acceptedEmxTokenTerms={acceptedEmxTokenTerms}
            isSaftHolder={isSaftHolder}
          />
        </>
      </BodyClassName>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(IsMobile(TraderApp));
