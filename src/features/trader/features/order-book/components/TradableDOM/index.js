import React from 'react';

import ToolBar from '../../../trade-mode/components/ToolBar'; // TODO uplift
import { OrderEntryConsumer } from '../../../order-entry/OrderEntryContext';

import TradableDOMTable from './components/TradableDOMTable';

const TradableDOM = () => (
  <OrderEntryConsumer>
    {({ globalContract: { quoteCurrency, underlying } }) => (
      <>
        <ToolBar />
        <TradableDOMTable quoteCurrency={quoteCurrency} underlying={underlying} />
      </>
    )}
  </OrderEntryConsumer>
);

export default TradableDOM;
