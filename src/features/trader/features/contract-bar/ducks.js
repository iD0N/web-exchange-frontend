import mapValues from 'lodash.mapvalues';

import { CONTRACT_TYPE } from '../../../../common/enums';
import { createMarkedSelector } from '../../../../common/utils/reduxHelpers';

import { selectContracts, selectTickerData } from '../../data-store/ducks';

export const selectPricedContracts = createMarkedSelector(
  'selectPricedContracts',
  selectContracts,
  selectTickerData,
  (contracts, tickerData) =>
    mapValues(contracts, contract => ({
      contractCode: contract.contractCode,
      seriesCode: contract.seriesCode,
      longName: contract.longName,
      priceDecimals: contract.priceDecimals,
      price:
        (tickerData[contract.contractCode] &&
          (contract.type === CONTRACT_TYPE.SPOT
            ? tickerData[contract.contractCode].fairPrice
            : tickerData[contract.contractCode].markPrice)) ||
        contract.lastPrice,
      direction:
        tickerData[contract.contractCode] &&
        (contract.type === CONTRACT_TYPE.SPOT
          ? tickerData[contract.contractCode].fairPriceDirection
          : tickerData[contract.contractCode].markPriceDirection),
    }))
);

export const selectCategorizedContracts = createMarkedSelector(
  'selectCategorizedContracts',
  selectContracts,
  contracts => {
    const sortedByExpiry = Object.entries(contracts).reduce((arr, [key, item]) => [...arr, item], []);
    sortedByExpiry.sort((a, b) => Date.parse(a.expiryTime) - Date.parse(b.expiryTime));
    const byUnderlying = sortedByExpiry.reduce(
      (acc, { contractCode, expiryName, expiryTime, longName, type, underlying, spreadContractCodeFront, spreadContractCodeBack }) => {

        return ({
        ...acc,
        [underlying]: acc[underlying]
          ? [...acc[underlying], { contractCode, expiryName, expiryTime, longName, type, spreadContractCodeFront, spreadContractCodeBack }]
          : [{ contractCode, expiryName, expiryTime, longName, type, spreadContractCodeFront, spreadContractCodeBack }],
        })
      },
      {}
    );
    const categorized = Object.keys(byUnderlying).reduce(
      (acc, underlying) => {
        return ({
          ...acc,
          [underlying]: { 
            [CONTRACT_TYPE.FUTURE]: [],
            [CONTRACT_TYPE.FUTURE_SPREAD]: [],
            [CONTRACT_TYPE.SPOT]: [],
          },
        })
      },
      {}
    );
    Object.entries(byUnderlying).forEach(([underlying, contracts]) => {
      contracts.forEach(contract => {
        switch (contract.type) {
          case CONTRACT_TYPE.SWAP:
            categorized[underlying][CONTRACT_TYPE.FUTURE].unshift(contract);
            break;
          case CONTRACT_TYPE.FUTURE:
            categorized[underlying][CONTRACT_TYPE.FUTURE].push(contract);
            break;
          case CONTRACT_TYPE.FUTURE_SPREAD:
            categorized[underlying][CONTRACT_TYPE.FUTURE_SPREAD].push(contract);
            break;
          case CONTRACT_TYPE.SPOT:
            categorized[underlying][CONTRACT_TYPE.SPOT].push(contract);
            break;
          default:
            break;
        }
      });
    });

    // console.log('categorized', categorized);

    let reOrdered = preferredOrder(categorized, [
      "BTC", "ETH", "TECH100", "HK50"
    ])    

    // console.log('reOrdered: ', reOrdered);
    // return categorized;
    return reOrdered;
  }
);

function preferredOrder(obj, order) {
  var newObject = {};
  for (var i = 0; i < order.length; i++) {
    if (obj.hasOwnProperty(order[i])) {
      newObject[order[i]] = obj[order[i]];
    }
  }
  return newObject;
}