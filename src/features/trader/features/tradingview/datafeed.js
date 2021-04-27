import HistoryProvider from './history';
import { supportedResolutions } from './config';

const config = {
  supported_resolutions: supportedResolutions,
};

let historyProvider;

const DataFeed = ({ contractsMetadata, quoteFeed, setChartUpdater, setResolution }) => ({
  onReady: cb => {
    //console.log('=====onReady running');
    setTimeout(() => cb(config), 0);
  },
  searchSymbols: (userInput, exchange, symbolType, onResultReadyCallback) => {
    const results = Object.entries(contractsMetadata).reduce(
      (results, [contractCode, { isExpired, type }]) =>
        !isExpired && contractCode.toLowerCase().match(userInput.toLowerCase())
          ? [
              ...results,
              {
                full_name: `ACDX:${contractCode}`,
                description: `ACDX:${contractCode}`,
                symbol: contractCode,
                exchange: 'ACDX',
                ticker: contractCode,
                name: contractCode,
                type,
              },
            ]
          : results,
      []
    );
    onResultReadyCallback(results);
  },
  resolveSymbol: (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
    // expects a symbolInfo object in response
    //console.log('======resolveSymbol running');
    let symbolParts = symbolName.split(/[:/]/);
    let contractCode = symbolParts.length === 1 ? symbolParts[0] : symbolParts[1];
    const isIndex = contractCode.substring(0, 1) === '.';
    const { assetClass, indexCode, priceDecimals, minimumPriceIncrement } =
      //slice(1) to ommit the index . prefix
      contractsMetadata[isIndex ? contractCode.slice(1) : contractCode] || {};

    const symbol_stub = {
      name: isIndex ? indexCode : contractCode,
      description: contractCode,
      type: assetClass,
      session: '24x7',
      ticker: contractCode,
      exchange: 'ACDX',
      minmov: Number(minimumPriceIncrement) * Math.pow(10, priceDecimals),
      pricescale: Math.pow(10, priceDecimals),
      fractional: false,
      has_intraday: true,
      has_empty_bars: true,
      intraday_multipliers: ['1', '5', '30'],
      supported_resolution: supportedResolutions,
      volume_precision: 8,
      data_status: 'streaming',
      timeframe: '3H',
      isIndex,
    };

    setTimeout(function() {
      onSymbolResolvedCallback(symbol_stub);
    }, 0);

    // onResolveErrorCallback('Not feeling it today')
  },
  getBars: (
    symbolInfo,
    resolution,
    from,
    to,
    onHistoryCallback,
    onErrorCallback,
    firstDataRequest
  ) => {
    // console.log('=====getBars running');

    if (!historyProvider) {
      historyProvider = HistoryProvider({ contractsMetadata, quoteFeed });
    }
    
    try {
      historyProvider
        .getBars(symbolInfo, resolution, from, to, firstDataRequest)
        //quotes = bars from ref doc
        .then(quotes => {
          if (quotes.length) {
            onHistoryCallback(quotes, { noData: false });
          } else {
            onHistoryCallback(quotes, { noData: true });
          }
        })
        .catch(err => {
          //console.log({ err });
          //onErrorCallback(err);
        });
    } catch (err) {
      // console.log('err from getBars()', err);
    }
  },
  subscribeBars: (
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscribeUID,
    onResetCacheNeededCallback
  ) => {
    setResolution(resolution);
    setChartUpdater(symbolInfo.ticker, {
      onRealtimeCallback,
      getUpdatedLastBar: historyProvider.getUpdatedLastBar,
    });
  },
  unsubscribeBars: subscriberUID => {
    let contractCode = subscriberUID.split('_');
    contractCode = contractCode.slice(0, contractCode.length - 1)[0];
    setChartUpdater(contractCode, undefined);
    setChartUpdater(`.${contractCode}`, undefined);
    if (historyProvider) {
      historyProvider.clearHistory(contractCode);
    }
    //console.log('=====unsubscribeBars running');
  },
  calculateHistoryDepth: (resolution, resolutionBack, intervalBack) => {
    //optional
    //console.log('=====calculateHistoryDepth running');
    setResolution(resolution);
    if (resolution === '1D') {
      return { resolutionBack: 'M', intervalBack: '1' };
    }
    if (resolution === '1W') {
      return { resolutionBack: 'M', intervalBack: '3' };
    }
    if (resolution === '1M') {
      return { resolutionBack: 'M', intervalBack: '12' };
    }
    // while optional, this makes sure we request 24 hours of minute data at a time
    // CryptoCompare's minute data endpoint will throw an error if we request data beyond 7 days in the past, and return no data
    return { resolutionBack: 'D', intervalBack: '1' };
  },
  getMarks: (symbolInfo, startDate, endDate, onDataCallback, resolution) => {
    //optional
    //console.log('=====getMarks running');
  },
  getTimeScaleMarks: (symbolInfo, startDate, endDate, onDataCallback, resolution) => {
    //optional
    //console.log('=====getTimeScaleMarks running');
  },
  getServerTime: cb => {
    //console.log('=====getServerTime running');
  },
});

export default DataFeed;
