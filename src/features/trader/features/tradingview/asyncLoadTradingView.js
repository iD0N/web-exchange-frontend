import makeAsyncScriptLoader from 'react-async-script';

const TV_SRC = '/charting_library/charting_library.min.js';

const asyncLoadTradingView = WrappedComponent =>
  makeAsyncScriptLoader(TV_SRC, { globalName: 'TradingView' })(WrappedComponent);

export default asyncLoadTradingView;
