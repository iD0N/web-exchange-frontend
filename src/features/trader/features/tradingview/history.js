import BigNumber from 'bignumber.js';

import { isInSameBar } from './services/quoteFeed/utils';

const history = {};

const extractIndexBars = quotes => {

  return quotes.reduce(
    (arr, { time, indexPrice }) =>
      !!indexPrice
        ? [
            ...arr,
            {
              time,
              indexPrice,
              high: indexPrice,
              low: indexPrice,
              open: indexPrice,
              close: indexPrice,
            },
          ]
        : arr,
    []
  );
};

const HistoryProvider = ({ contractsMetadata, quoteFeed }) => ({
  history: history,

  getBars: async function({ name, ticker, isIndex }, resolution, from, to, first, limit) {

    const contractCode = isIndex ? ticker.slice(1) : ticker;

    if (!history[ticker]) {
      history[ticker] = {};
    }

    if (isIndex) {
      //if quotes is not empty
      if (history[contractCode] && history[contractCode].indexPrices) {
        const quotes = [...history[contractCode].indexPrices];
        delete history[contractCode].indexPrices;
        const lastBar = quotes[quotes.length - 1];
        if (
          lastBar &&
          first &&
          (!history[ticker].lastBar || history[ticker].lastBar.time < lastBar.time)
        ) {
          history[ticker].lastBar = lastBar;
        }
        return new Promise(resolve => resolve(quotes));
      }

      //initial fetch index data
      const { quotes } = await quoteFeed.fetchInitialData(contractCode, from, to, { resolution });
      const lastBar = quotes[quotes.length - 1];
      if (
        lastBar &&
        first &&
        (!history[ticker].lastBar || history[ticker].lastBar.time < lastBar.time)
      ) {
        history[ticker].lastBar = lastBar;
      }
      return new Promise(resolve => resolve(extractIndexBars(quotes || [])));
    }

    const { quotes } = await quoteFeed.fetchInitialData(contractCode, from, to, { resolution });
    const lastBar = quotes[quotes.length - 1];

    history[ticker].indexPrices = history[ticker].indexPrices
      ? [...history[ticker].indexPrices, ...extractIndexBars(quotes)]
      : extractIndexBars(quotes);

    if (
      lastBar &&
      first &&
      (!history[ticker].lastBar || history[ticker].lastBar.time < lastBar.time)
    ) {
      history[ticker].lastBar = lastBar;
    }
    
    return new Promise(resolve => resolve(quotes || []));
    // // fake candle data
    // if (ticker === 'ETH-PERP' || ticker === 'BTC-0925') {
    //   return new Promise(resolve => resolve(extractIndexBars(quotes) || []));
    // } else {
    //   //original implementation
    //   return new Promise(resolve => resolve(quotes || []));
    // }
  },

  getUpdatedLastBar: (contractCode, data, resolution, isIndex) => {
    const { lastBar } = history[contractCode] || { time: 0 };

    const priceKey = isIndex ? 'IndexPrice' : 'Last';

    let time = Math.max.apply(null, [Date.parse(data.IDT), Date.parse(data.DT)]);
    time = Math.floor(time / resolution) * resolution;

    if (!lastBar || !isInSameBar(time, lastBar.time, resolution)) {
      if (!history[contractCode]) {
        history[contractCode] = {};
      }

      if (lastBar && lastBar.time > time) {
        return lastBar;
      }

      // adding data to brand new candle
      history[contractCode].lastBar = {
        time,
        open: lastBar ? lastBar.close : data[priceKey],
        high: data[priceKey],
        low: data[priceKey],
        close: data[priceKey],
        volume: data.Volume,
      };
    } else {
      history[contractCode].lastBar = {
        time: lastBar.time,
        open: lastBar.open,
        high: lastBar.high > data[priceKey] ? lastBar.high : data[priceKey],
        low: lastBar.low < data[priceKey] ? lastBar.low : data[priceKey],
        close: data[priceKey],
        volume: isIndex
          ? 0
          : BigNumber(data.Volume)
              .plus(lastBar.volume)
              .toNumber(),
      };
    }

    return history[contractCode].lastBar;
  },

  clearHistory: contractCode => {
    delete history[contractCode];
    delete history[`.${contractCode}`];
  },
});

export default HistoryProvider;
