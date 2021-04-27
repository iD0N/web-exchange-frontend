import BigNumber from 'bignumber.js';

export const normalizeAuction = ({ volume, price, logicalTime }) =>
  !BigNumber(volume).isZero()
    ? {
        lastTradeVolume: volume,
        lastTradePrice: price,
        lastTradeTime: logicalTime,
        lastTradeTimestamp: Date.parse(logicalTime),
      }
    : undefined;

export const normalizeForLists = auctions =>
  auctions
    .reduce((list, auction) => {
      const auctionData = normalizeAuction(auction);
      return auctionData ? [auctionData, ...list] : list;
    }, [])
    .sort((a, b) => b.lastTradeTimestamp - a.lastTradeTimestamp);
