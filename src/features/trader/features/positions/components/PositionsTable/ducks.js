import { createMarkedSelector } from '../../../../../../common/utils/reduxHelpers';

import {
  selectTokenBalances,
  selectTickerData,
  selectCollateralTokens,
} from '../../../../data-store/ducks';
import { selectNlv } from '../../../account-summary/ducks';

import {
  selectPositionsContracts,
  selectPositionsData,
  selectPositionsMarked,
  createContractFieldsSelector,
} from '../../ducks';
import { getLiquidationPricesWithPositions } from '../../utils';

/**
 * SELECTORS
 */
export const selectPositionsTableRows = createMarkedSelector(
  'selectPositionsTableRows',
  selectPositionsContracts,
  selectPositionsData,
  selectPositionsMarked,
  selectNlv,
  createContractFieldsSelector([
    'initialMarginBase',
    'initialMarginPerContract',
    'liquidationInitialRatio',
    'liquidationMargin',
    'priceDecimals',
    'minimumPriceIncrement',
  ]),
  selectTokenBalances,
  selectTickerData,
  selectCollateralTokens,
  (
    posContracts,
    posData,
    posMarked,
    nlv,
    contracts,
    tokenBalances,
    tickerData,
    collateralTokens
  ) => {
    if (posContracts.length === 0) {
      return [];
    }

    // merge data and marked
    const posMerged = {};
    for (const contractCode of posContracts) {
      posMerged[contractCode] = {
        ...posData[contractCode],
        ...posMarked[contractCode],
      };
    }

    const liquidationPriceByContract = getLiquidationPricesWithPositions(
      posMerged,
      nlv,
      contracts,
      tokenBalances,
      collateralTokens
    );

    return posContracts.map(contractCode => ({
      ...posMerged[contractCode],
      liquidationPrice: liquidationPriceByContract[contractCode],
      lastTradePrice: (tickerData[contractCode] || {}).lastTradePrice,
    }));
  }
);
