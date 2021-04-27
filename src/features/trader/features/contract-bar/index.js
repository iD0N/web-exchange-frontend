import React, { Component, memo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { show } from 'redux-modal';
import { Trans } from 'react-i18next';

import {
  openGlobalContractAction,
  selectGlobalContract,
  selectContractCodes,
} from '../../data-store/ducks';
import ContractSubscription from '../../ws-subscription/containers/ContractSubscription';
import { CONTRACT_TYPE } from '../../../../common/enums';
import { Icon, IsMobile, Spin } from '../../../../common/components';
import { PerfectScrollbar, Value } from '../../../../common/components/trader';
import { getSeriesLongName } from '../../../../common/utils/translationMaps';
import { WS_CHANNELS } from '../../constants';
import { TRADER_SETTINGS_MODAL } from '../../components/SettingsModal';
import { fetchSummaryActions, selectSummary } from '../../../../features/dashboard/ducks';
import PercentChange from '../../../../features/dashboard/components/PercentChange';

import { selectCategorizedContracts, selectPricedContracts } from './ducks';
import ContractBarItem from './components/ContractBarItem';

const mapStateToProps = state => {
  const summary = selectSummary(state);
  const globalContract = selectGlobalContract(state);
  const contractSummary = summary.find(
    ({ contractCode }) => contractCode === globalContract.contractCode
  );

  return {
    contractCodes: selectContractCodes(state),
    contractsByUnderlying: selectCategorizedContracts(state),
    globalContract,
    pricedContracts: selectPricedContracts(state),
    referencePrice: contractSummary ? contractSummary.originalPrice24h : undefined,
  };
};

const mapDispatchToProps = {
  openGlobalContract: openGlobalContractAction,
};

const ContractBar = ({
  contractCodes,
  contractsByUnderlying,
  pricedContracts,
  globalContract,
  globalContract: { contractCode: globalContractCode },
  openGlobalContract,
}) => {
  // console.log('[ContractBar]>contractCodes', contractCodes);
  // console.log('[ContractBar]>pricedContracts', pricedContracts);
  // console.log('[ContractBar]>globalContractCode', globalContractCode);
  // console.log('[ContractBar]>openGlobalContract', openGlobalContract);

  const { underlying: globalUnderlying } = globalContract;

  return (
    <div className="contract-bar-wrapper">
      <Spin spinning={!contractCodes.length}>
        {contractCodes.length > 0 && (
          <ContractSubscription contractCodes={contractCodes} channel={WS_CHANNELS.TICKER}>
            <PerfectScrollbar>
              {Object.entries(contractsByUnderlying).map(([underlying, contracts]) => (
                <ContractBarItem
                  key={underlying}
                  underlying={underlying}
                  contracts={contracts}
                  price={pricedContracts[contracts[CONTRACT_TYPE.FUTURE][0].contractCode].price}
                  priceDecimals={
                    pricedContracts[contracts[CONTRACT_TYPE.FUTURE][0].contractCode].priceDecimals
                  }
                  direction={
                    pricedContracts[contracts[CONTRACT_TYPE.FUTURE][0].contractCode].direction
                  }
                  selected={underlying === globalUnderlying}
                  globalContractCode={globalContractCode}
                  openGlobalContract={openGlobalContract}
                />
              ))}
            </PerfectScrollbar>
          </ContractSubscription>
        )}
      </Spin>
    </div>
  );
};

const mapActionsToProps = {
  fetchSummary: fetchSummaryActions.request,
  showSettingsModal: () => show(TRADER_SETTINGS_MODAL),
};

class ContractBarDetails extends Component {
  componentDidMount() {
    this.props.fetchSummary();
  }

  render() {
    const { globalContract, isMobile, pricedContracts, referencePrice, showSettingsModal } = this.props;

    if (!globalContract || !pricedContracts || !pricedContracts[globalContract.contractCode]) {
      return null;
    }

    const { contractCode, longName, priceDecimals } = globalContract;

    return (
      <div className="contract-bar-details">
        {!isMobile && <div>{getSeriesLongName(contractCode) || longName}</div>}
        <div>{contractCode}</div>
        <div>
          <Value.Numeric
            type="price"
            value={pricedContracts[contractCode].price}
            decimals={priceDecimals}
            direction={pricedContracts[contractCode].direction}
          />
        </div>
        {referencePrice && (
          <div>
            <PercentChange
              decimals={2}
              contractCode={contractCode}
              defaultMarkPrice={pricedContracts[contractCode].price}
              referencePrice={referencePrice}
            />
          </div>
        )}
        {!isMobile && <div className="contract-bar-settings" onClick={showSettingsModal}>
          <Trans i18nKey="trader.contractBar.settings">Settings</Trans>
          <Icon type="setting" />
        </div>}
      </div>
    );
  }
}

ContractBar.propTypes = {
  contractCodes: PropTypes.array.isRequired,
  pricedContracts: PropTypes.object.isRequired,
  globalContractCode: PropTypes.string,
  openGlobalContract: PropTypes.func.isRequired,
};

export const Details = connect(mapStateToProps, mapActionsToProps)(memo(IsMobile(ContractBarDetails)));

export default connect(mapStateToProps, mapDispatchToProps)(memo(ContractBar));
