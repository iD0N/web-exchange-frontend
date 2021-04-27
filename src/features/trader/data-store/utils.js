import moment from 'moment';

import { CONTRACT_TYPE } from '../../../common/enums';
import currentContract from '../../../common/utils/currentContract';

const predefinedOrder = [
  'US500',
  'GOLD',
  'USOIL',
  'USDBRL',
  'BTC',
  'ETH',
  'ACDX',
  'LTC',
  'BCH',
  'LINK',
  'USDT',
  'XTZ',
  'EUR',
];

const CRYPTO_ASSET_CLASS = 'CRYPTO';

export const sortContractCodes = contracts => {
  const normalized = contracts
    .filter(
      ({ contractCode, isExpired, markPrice, type }) =>
        !isExpired && (type === CONTRACT_TYPE.SPOT || !!markPrice)
    )
    .map(contract => ({
      ...contract,
      sortableSeriesName:
        contract.assetClass === CRYPTO_ASSET_CLASS ? contract.underlying : contract.seriesCode,
    }));

  const seriesCodeMap = {};
  normalized.forEach(contract => {
    if (!seriesCodeMap[contract.sortableSeriesName]) {
      seriesCodeMap[contract.sortableSeriesName] = [];
    }
    seriesCodeMap[contract.sortableSeriesName].push(contract);
  });

  for (let k in seriesCodeMap) {
    seriesCodeMap[k].sort((a, b) =>
      a.expiryTime === b.expiryTime
        ? 0
        : moment(a.expiryTime || 0).isAfter(b.expiryTime || 0)
        ? 1
        : -1
    );

    // put spot at end
    let l = seriesCodeMap[k].length;
    while (l--) {
      if (seriesCodeMap[k][l].type === CONTRACT_TYPE.SPOT) {
        const contract = seriesCodeMap[k][l];
        seriesCodeMap[k].splice(l, 1);
        seriesCodeMap[k].push(contract);
      }
    }
  }

  const ordered = predefinedOrder.reduce((arr, sortableSeriesName) => {
    const seriesContracts = seriesCodeMap[sortableSeriesName];
    delete seriesCodeMap[sortableSeriesName];
    return [...arr, ...(seriesContracts || [])];
  }, []);

  const remaining = Object.entries(seriesCodeMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .reduce((arr, [seriesCode, contracts]) => [...arr, ...contracts], []);

  let liveContracts = [...ordered, ...remaining];
  // Do not sort crypto contracts before macro. (We used to do this.)
  // let l = liveContracts.length;
  // const cryptoAssets = [];
  // while (l--) {
  //   if (liveContracts[l].assetClass === CRYPTO_ASSET_CLASS) {
  //     const contract = liveContracts[l];
  //     liveContracts.splice(l, 1);
  //     cryptoAssets.unshift(contract);
  //   }
  // }
  //
  // console.error({ cryptoAssets });
  // console.error({ liveContracts });
  // liveContracts = [...cryptoAssets, ...liveContracts];
  if (!liveContracts.length) {
    const expiredBtc = contracts.find(({ seriesCode }) => seriesCode === 'BTC');
    if (expiredBtc) {
      return [{ ...expiredBtc, price: expiredBtc.lastPrice }];
    }
  }
  return liveContracts;
};

export const findContractBySeries = (contracts, seriesCode) => {
  if (contracts.length) {
    const seriesContracts = contracts
      .sort((a, b) => (b.type === CONTRACT_TYPE.SWAP) - (a.type === CONTRACT_TYPE.SWAP))
      .map(({ isExpired, seriesCode: _seriesCode, contractCode }) =>
        !isExpired && _seriesCode === seriesCode ? contractCode : false
      )
      .filter(a => !!a);
    if (seriesContracts.length) {
      return seriesContracts[0];
    }
  }
  return currentContract(seriesCode);
};
