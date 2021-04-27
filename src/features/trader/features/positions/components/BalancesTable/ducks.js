import BigNumber from 'bignumber.js';

import { createMarkedSelector } from '../../../../../../common/utils/reduxHelpers';
import { CONTRACT_TYPE, ORDER_SIDE, ORDER_TYPE } from '../../../../../../common/enums';

import {
  selectTokenBalances,
  selectContracts,
  selectVisibleTokens,
  selectCollateralPrices,
} from '../../../../data-store/ducks';
import { selectActiveOrders } from '../../../orders/ducks';

/**
 * SELECTORS
 */
export const selectBalancesTable = createMarkedSelector(
  'selectBalancesTable',
  selectTokenBalances,
  selectVisibleTokens,
  selectContracts,
  selectCollateralPrices,
  selectActiveOrders,
  (tokenBalances, visibleTokens, contracts, collateralPrices, orders) => {
    return visibleTokens.map(({ decimalPlaces = 8, tokenCode, isTransferable }, index) => {
      const relatedContracts = { forBuys: [], forSells: [] };

      Object.values(contracts).forEach(({ contractCode, quoteCurrency, type, underlying }) => {
        if (type === CONTRACT_TYPE.SPOT) {
          if (underlying === tokenCode) {
            relatedContracts.forSells.push(contractCode);
          } else if (quoteCurrency === tokenCode) {
            relatedContracts.forBuys.push(contractCode);
          }
        }
      });

      let pendingSells = 0;
      if (relatedContracts.forSells.length + relatedContracts.forBuys.length > 0) {
        pendingSells = orders
          .filter(({ orderType }) => orderType === ORDER_TYPE.LIMIT)
          .reduce((sum, { orderType, price, side, contractCode, size, sizeFilled }) => {
            if (relatedContracts.forSells.includes(contractCode) && side === ORDER_SIDE.SELL) {
              return sum.plus(BigNumber(size).minus(sizeFilled || 0));
            } else if (relatedContracts.forBuys.includes(contractCode) && side === ORDER_SIDE.BUY) {
              const makerFeePlusOne = BigNumber(1).plus(contracts[contractCode].makerFee);
              return sum.plus(
                BigNumber(price)
                  .times(makerFeePlusOne)
                  .times(BigNumber(size).minus(sizeFilled || 0))
              );
            }
            return sum;
          }, BigNumber(0))
          .toNumber();
      }

      const balance = tokenBalances[tokenCode.toLowerCase()] || 0;
      const freeBalance = BigNumber(balance)
        .minus(pendingSells)
        .toNumber();

      const tokenPrice = collateralPrices[tokenCode];
      if (!BigNumber(tokenPrice).isFinite()) {
        return {
          tokenCode,
          isTransferable,
          balance,
          decimalPlaces,
          freeBalance,
          price: undefined,
          marketValue: undefined,
          rowKey: index,
        };
      }

      return {
        tokenCode,
        isTransferable,
        balance,
        decimalPlaces,
        freeBalance,
        price: tokenPrice,
        marketValue: BigNumber(tokenPrice)
          .multipliedBy(balance)
          .dp(2)
          .toNumber(),
        rowKey: index,
      };
    });
  }
);

export const selectTokenFreeBalance = createMarkedSelector(
  'selectTokenFreeBalance',
  selectBalancesTable,
  (_, tokenCode) => tokenCode,
  (balances, tokenCode) => {
    const { freeBalance } = balances.find(tokenBalance => tokenBalance.tokenCode === tokenCode) || {
      freeBalance: 0,
    };
    return freeBalance;
  }
);
