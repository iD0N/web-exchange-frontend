import { CONTRACT_TYPE } from '../../../common/enums';
import { toPriceString } from '../../../common/utils/numberHelpers';

import { WS_CHANNELS } from '../constants';

const nonStringToUndefined = (map, entry) => ({
  ...map,
  [entry[0]]: typeof entry[1] === 'string' ? entry[1] : undefined,
});

const tickerTransform = (
  {
    channel,
    type,
    data,
    data: {
      afterAuctionCode,
      contractCode,
      dollarizer,
      fairPrice,
      lastTrade,
      markPrice,
      indexPrice,
      quote,
    },
  },
  { priceDecimals, type: contractType } = { priceDecimals: 2, type: CONTRACT_TYPE.SWAP }
) => {
  const lastTradeData = Object.entries(lastTrade).reduce(nonStringToUndefined, {});
  const quoteData = Object.entries(quote).reduce(nonStringToUndefined, {});

  return {
    channel,
    type,
    data: {
      contractCode,
      dollarizer,
      lastTradeVolume: lastTradeData.volume,
      lastTradePrice: toPriceString(lastTradeData.price, priceDecimals),
      lastTradeTime: lastTradeData.logicalTime,
      lastIndexPriceUpdate: data.logicalTime,
      askPrice: toPriceString(quoteData.ask, priceDecimals),
      bidPrice: toPriceString(quoteData.bid, priceDecimals),
      markPrice: toPriceString(markPrice, priceDecimals),
      fairPrice: toPriceString(fairPrice, priceDecimals),
      indexPrice: toPriceString(indexPrice, priceDecimals),
      isNewTrade: lastTradeData.auctionCode === afterAuctionCode,
    },
  };
};

export default function transformDataMessage(data, priceDecimals) {
  return data.channel === WS_CHANNELS.TICKER ? tickerTransform(data, priceDecimals) : data;
}
