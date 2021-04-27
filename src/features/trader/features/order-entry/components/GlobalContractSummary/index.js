import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import BigNumber from 'bignumber.js';

import { CONTRACT_TYPE } from '../../../../../../common/enums';
import IsLoggedIn from '../../../../../../common/services/user/IsLoggedIn';
import {
  selectGlobalContractCode,
  selectGlobalContractFundingData,
  selectTickerData,
} from '../../../../data-store/ducks';
import {
  selectContractsMapWithMargins,
  selectPositionQuantity,
} from '../../../../features/positions/ducks';
import { selectContractEffectiveLeverage } from '../../ducks';

import ContractSummary from '../ContractSummary';

const mapStateToProps = state => {
  const contractCode = selectGlobalContractCode(state);
  const globalContract = selectContractsMapWithMargins(state)[contractCode];
  const { initialMargin, type } = globalContract;
  const { lastTradePrice, markPrice, usdPriceActual: usdPrice } =
    selectTickerData(state)[contractCode] || {};
  const fundingData =
    type === CONTRACT_TYPE.SWAP ? selectGlobalContractFundingData(state) : undefined;
  const price = markPrice;
  const lastTrade = lastTradePrice;
  const positionSize = selectPositionQuantity(state, contractCode);
  return {
    ...globalContract,
    lastTradePrice: lastTrade,
    usdPrice: String(usdPrice),
    maxLeverage: !!price
      ? BigNumber(price)
          .dividedBy(initialMargin)
          .dp(0)
          .toNumber()
      : undefined,
    effectiveLeverage: selectContractEffectiveLeverage(state, contractCode),
    positionSize:
      BigNumber(positionSize).isPositive() && !BigNumber(positionSize).isZero()
        ? `+${positionSize}`
        : positionSize,
    fundingData,
  };
};

const GlobalContractSummary = ({
  contractCode,
  seriesCode,
  longName,
  priceDecimals,
  quoteCurrency,
  quoteLongName,
  underlying,
  type,
  initialMarginPercent,
  liquidationMarginPercent,
  lastTradePrice,
  effectiveLeverage,
  fundingData,
  maxLeverage,
  positionSize,
  usdPrice,
  isLoggedIn,
}) => (
  <ContractSummary>
    <ContractSummary.ContractCode
      contractCode={contractCode}
      initialMarginPercent={initialMarginPercent}
      liquidationMarginPercent={liquidationMarginPercent}
      longName={longName}
      quoteCurrency={quoteCurrency}
      quoteLongName={quoteLongName}
      seriesCode={seriesCode}
      underlying={underlying}
      type={type}
    />
    <ContractSummary.ContractType contractCode={contractCode} funding={fundingData} value={type} />
    {type === CONTRACT_TYPE.SWAP ? (
      <ContractSummary.Funding funding={fundingData} />
    ) : (
      <>
        <ContractSummary.LastTradePrice
          decimals={priceDecimals}
          quoteCurrency={quoteCurrency}
          value={lastTradePrice}
        />
        {usdPrice && type === CONTRACT_TYPE.SPOT && quoteCurrency === 'BTC' ? (
          <ContractSummary.LastTradePrice decimals={2} quoteCurrency={'USD'} value={usdPrice} />
        ) : null}
      </>
    )}
    {type !== CONTRACT_TYPE.SPOT && (
      <ContractSummary.MaxLeverage
        contractCode={contractCode}
        effectiveLeverage={effectiveLeverage}
        positionSize={positionSize}
        value={maxLeverage}
        isLoggedIn={isLoggedIn}
      />
    )}
  </ContractSummary>
);

GlobalContractSummary.propTypes = {
  maxLeverage: PropTypes.number,
  lastTradePrice: PropTypes.string,
  fundingData: PropTypes.object,
  isLoggedIn: PropTypes.bool.isRequired,
};

export default connect(mapStateToProps)(IsLoggedIn(GlobalContractSummary));
