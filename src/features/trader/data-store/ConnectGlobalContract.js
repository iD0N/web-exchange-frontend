import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { selectGlobalContract, selectGlobalContractTickerData } from './ducks';

const ConnectGlobalContract = WrappedComponent => props =>
  props.globalContract ? <WrappedComponent {...props} /> : null;

const ConnectGlobalContractWithTicker = WrappedComponent => props =>
  props.globalContract ? <WrappedComponent {...props} /> : null;

export default ({ tickerDataSelector } = {}) =>
  compose(
    tickerDataSelector
      ? connect(state => ({
          globalContract: selectGlobalContract(state),
          ...tickerDataSelector(selectGlobalContractTickerData(state)),
        }))
      : connect(state => ({
          globalContract: selectGlobalContract(state),
        })),
    tickerDataSelector ? ConnectGlobalContractWithTicker : ConnectGlobalContract
  );
