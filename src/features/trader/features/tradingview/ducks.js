import { takeLatest, put } from 'redux-saga/effects';
import { createSelector } from 'reselect';

import { isProd } from '../../../../config';
import { createActionCreator } from '../../../../common/utils/reduxHelpers';
import { CONTRACT_TYPE, ORDER_TYPE } from '../../../../common/enums';
import {
  getValueActions,
  setValueAction,
  createValueSelector,
  ignoreErrorOptions,
} from '../../../../common/services/keyValueStore';
import {
  selectTickerData,
  selectGlobalContractCode,
  selectContracts,
} from '../../data-store/ducks';
import { selectOpenOrdersFiltered } from '../orders/ducks'; // TODO uplift
import { ORDER_STATUS } from '../orders/constants'; // TODO uplift
import { generatePriceLevelTypeMap } from '../orders/utils'; // TODO uplift
import defaultChartConfig from './config';

export const CHART_CONFIG_VALUE_KEY = 'chartConfig';

export const apiCallIds = {
  GET_CHART_CONFIG: 'GET_CHART_CONFIG',
};

/**
 * ACTION TYPES
 */
export const FETCH_CONFIG = 'chart/FETCH_CONFIG';
export const SET_CONFIG = 'chart/SET_CONFIG';
export const CHANGE_CONFIG = 'chart/CHANGE_CONFIG';

/**
 * ACTIONS
 */
export const fetchConfigAction = createActionCreator(FETCH_CONFIG);
export const setConfigAction = createActionCreator(SET_CONFIG);
export const changeConfigAction = createActionCreator(CHANGE_CONFIG);

/**
 * SELECTORS
 */
export const selectChartConfig = createSelector(
  createValueSelector(CHART_CONFIG_VALUE_KEY),
  chartConfig => {
    if (chartConfig) {
      const { layout, ...config } = chartConfig;

      try {
        return {
          ...defaultChartConfig,
          ...config,
          layout: JSON.parse(layout),
        };
      } catch (err) {
        return { ...defaultChartConfig, ...config };
      }
    }
  }
);

export const selectChartData = createSelector(
  selectTickerData,
  selectGlobalContractCode,
  selectContracts,
  (tickerData, contractCode, contracts) => {
    const contractCodes = [contractCode];
    const { type } = contracts[contractCode] || { type: CONTRACT_TYPE.SWAP };

    return contractCodes.reduce(
      (data, contractCode) => ({
        ...data,
        [contractCode]: tickerData[contractCode] ? transform(tickerData[contractCode], type) : {},
      }),
      {}
    );
  }
);

export const selectLastPrice = createSelector(
  selectTickerData,
  selectGlobalContractCode,
  selectContracts,
  (tickerData, globalContractCode, contracts) => {
    const { type } = contracts[globalContractCode] || { type: CONTRACT_TYPE.SWAP };
    const { Last } = transform(tickerData[globalContractCode], type) || {
      Last: undefined,
    };

    return Last;
  }
);

const selectAcceptedOrders = createSelector(selectOpenOrdersFiltered, openOrders =>
  openOrders.filter(
    ({ orderType, status }) =>
      [ORDER_STATUS.ACCEPTED].includes(status) &&
      [ORDER_TYPE.LIMIT, ORDER_TYPE.STOP_MARKET, ORDER_TYPE.TAKE_MARKET].includes(orderType)
  )
);

const selectOrdersByPrice = createSelector(selectAcceptedOrders, orders =>
  generatePriceLevelTypeMap(
    orders.map(order => ({ ...order, price: order.price || order.stopPrice }))
  )
);

export const selectOrderLevels = createSelector(selectOrdersByPrice, ordersByPrice =>
  Object.entries(ordersByPrice).sort(([a], [b]) => Number(b) - Number(a))
);

/**
 * HELPERS
 */
const transform = (tickerData = {}, contractType) => ({
  Last: parseFloat(
    !isProd() || contractType === CONTRACT_TYPE.SPOT
      ? tickerData.lastTradePrice
      : tickerData.markPrice
  ),
  Volume: tickerData.isNewTrade ? parseFloat(tickerData.lastTradeVolume) : 0,
  Bid: parseFloat(tickerData.bidPrice),
  Ask: parseFloat(tickerData.askPrice),
  DT:
    !isProd() || contractType === CONTRACT_TYPE.SPOT
      ? tickerData.lastTradeTime
      : tickerData.lastIndexPriceUpdate,
  IDT: tickerData.lastIndexPriceUpdate,
  IndexPrice: parseFloat(tickerData.indexPrice),
});

/**
 * SAGAS
 */
export function* fetchConfig() {
  yield put(
    getValueActions.request({
      key: CHART_CONFIG_VALUE_KEY,
      options: {
        ...ignoreErrorOptions,
        apiCallId: apiCallIds.GET_CHART_CONFIG,
      },
      fallbackValue: defaultChartConfig,
    })
  );
}

export function* changeConfig({ payload: { layout, ...config } }) {
  yield put(
    setValueAction({
      key: CHART_CONFIG_VALUE_KEY,
      value: {
        ...config,
        layout: JSON.stringify(layout),
      },
    })
  );
}

export function* chartSaga() {
  yield takeLatest(FETCH_CONFIG, fetchConfig);
  yield takeLatest(CHANGE_CONFIG, changeConfig);
}
