import { takeEvery, put } from 'redux-saga/effects';
import BigNumber from 'bignumber.js';

import { ORDER_TYPE } from '../../../../common/enums';
import { createActionCreator, createMarkedSelector } from '../../../../common/utils/reduxHelpers';
import { sendMessageAction } from '../../../../common/services/webSocket';
import { WS_MESSAGE_TYPES, WS_CHANNELS } from '../../constants';
import {
  selectContractByCode,
  selectGlobalContract,
  selectTokenBalances,
  selectCollateralTokens,
} from '../../data-store/ducks';
import {
  selectPositionMarked,
  selectPositionsMarked,
  selectPositionsQuantityMarkPrice,
  createContractFieldsSelector,
} from '../positions/ducks'; // TODO uplift
import { getLiquidationPricesWithPositions } from '../positions/utils'; // TODO uplift
import { selectNlv } from '../account-summary/ducks';

import { getCostEstimate, getQuantityEstimate } from './utils';
import { AUTO_LIQUIDATION, AUTO_REJECT, CLOSE_OUT, SIZE_TYPE } from './constants';

export const apiCallIds = {
  FETCH_ORDER_ENTRY_WIDGET_CONFIG: 'FETCH_ORDER_ENTRY_WIDGET_CONFIG',
};

/**
 * ACTION TYPES
 */
export const SUBMIT_ORDER = 'orderEntry/SUBMIT_ORDER';

/**
 * ACTIONS
 */
export const submitOrderAction = createActionCreator(SUBMIT_ORDER);

/**
 * SELECTORS
 */
const selectOrderBook = state => state.orderBook;
const selectTraderDataStore = state => state.traderDataStore;
const selectTickerData = state => selectTraderDataStore(state).tickerData;
const selectOrderBookRawData = state => selectOrderBook(state).data;

export const selectQuantityEstimateFactory = () =>
  createMarkedSelector(
    'selectQuantityEstimateFactory',
    (state, contractCode) => selectContractByCode(state, contractCode),
    (state, contractCode) => selectTickerData(state)[contractCode],
    (_state, _contractCode, notional) => notional,
    (depth, globalContract, tickerData, contractCode, notional) =>
      getQuantityEstimate(depth, globalContract, tickerData, contractCode, notional)
  );

export const selectCostEstimateFactory = () =>
  createMarkedSelector(
    'selectCostEstimateFactory',
    selectOrderBookRawData,
    selectGlobalContract,
    (_state, contractCode) => contractCode,
    (_state, _contractCode, size) => size,
    (depth, globalContract, contractCode, size) =>
      getCostEstimate(depth, globalContract, contractCode, size)
  );

export const selectLiquidationPriceGivenPosition = createMarkedSelector(
  'selectLiquidationPriceGivenPosition',
  selectPositionsQuantityMarkPrice,
  selectNlv,
  createContractFieldsSelector([
    'initialMarginBase',
    'initialMarginPerContract',
    'liquidationInitialRatio',
    'liquidationMargin',
    'underlying',
    'minimumPriceIncrement',
  ]),
  selectTokenBalances,
  selectCollateralTokens,
  (_, position) => position,
  (positions, nlv, contracts, tokenBalances, collateralTokens, position) => {
    const liquidationPriceByContract = getLiquidationPricesWithPositions(
      { ...positions, [position.contractCode]: position },
      nlv,
      contracts,
      tokenBalances,
      collateralTokens
    );

    return liquidationPriceByContract[position.contractCode];
  }
);

export const selectLiquidationEstimateFactory = ({ selectMaxBuySell, selectCostEstimate }) =>
  createMarkedSelector(
    'selectLiquidationEstimateFactory',
    selectPositionsQuantityMarkPrice,
    selectNlv,
    createContractFieldsSelector([
      'dollarizer',
      'initialMarginBase',
      'initialMarginPerContract',
      'liquidationInitialRatio',
      'liquidationMargin',
      'markPrice',
      'minimumPriceIncrement',
      'underlying',
    ]),
    selectCostEstimate,
    selectMaxBuySell,
    selectTokenBalances,
    selectCollateralTokens,
    (_state, contractCode) => contractCode,
    (_state, _contractCode, size) => size,
    (_state, _contractCode, _size, sizeType) => sizeType,
    (_state, _contractCode, _size, _sizeType, orderType) => orderType,
    (
      positions,
      nlv,
      contracts,
      costEstimates,
      maxBuySell,
      tokenBalances,
      collateralTokens,
      contractCode,
      size,
      sizeType,
      orderType
    ) => {
      if (!size || Number.isNaN(Number(size)) || sizeType === SIZE_TYPE.NOTIONAL) {
        return {
          afterBuy: NaN,
          afterSell: NaN,
        };
      }
      const bufferedSize = BigNumber(size).multipliedBy(0.95);
      const {
        quantity: { buy: maxBuy, sell: maxSell },
      } = maxBuySell;
      if (bufferedSize.isGreaterThan(maxBuy) && bufferedSize.isGreaterThan(maxSell)) {
        return {
          afterBuy: AUTO_REJECT,
          afterSell: AUTO_REJECT,
        };
      }

      const { dollarizer, markPrice } = contracts[contractCode];
      const position = positions[contractCode] || { markPrice, dollarizer };

      const positionWithBuy = {
        unrealizedPl: 0,
        contractCode,
        ...position,
        quantity: BigNumber(size)
          .plus(position.quantity || 0)
          .toNumber(),
      };
      const positionWithSell = {
        unrealizedPl: 0,
        contractCode,
        ...position,
        quantity: BigNumber(size)
          .negated()
          .plus(position.quantity || 0)
          .toNumber(),
      };

      if (orderType === ORDER_TYPE.MARKET) {
        const { canBuy, canSell } = costEstimates;
        const canBuyPrice = BigNumber(canBuy)
          .dividedBy(size)
          .toNumber();
        const canSellPrice = BigNumber(canSell)
          .dividedBy(size)
          .toNumber();
        const unrealizedPlBuy = BigNumber(markPrice)
          .minus(canBuyPrice)
          .multipliedBy(size)
          .dp(2)
          .toNumber();
        const unrealizedPlSell = BigNumber(canSellPrice)
          .minus(markPrice)
          .multipliedBy(size)
          .dp(2)
          .toNumber();

        positionWithBuy.unrealizedPl = BigNumber(positionWithBuy.unrealizedPl)
          .plus(unrealizedPlBuy)
          .toNumber();
        positionWithSell.unrealizedPl = BigNumber(positionWithBuy.unrealizedPl)
          .plus(unrealizedPlSell)
          .toNumber();
      }

      const estimates = {
        afterBuy: positionWithBuy.quantity
          ? getLiquidationPricesWithPositions(
              { ...positions, [contractCode]: positionWithBuy },
              nlv,
              contracts,
              tokenBalances,
              collateralTokens
            )[contractCode]
          : undefined,
        afterSell: positionWithSell.quantity
          ? getLiquidationPricesWithPositions(
              { ...positions, [contractCode]: positionWithSell },
              nlv,
              contracts,
              tokenBalances,
              collateralTokens
            )[contractCode]
          : undefined,
      };

      if (positionWithBuy.quantity === 0) {
        estimates.afterBuy = CLOSE_OUT;
      } else if (bufferedSize.isGreaterThan(maxBuy)) {
        estimates.afterBuy = AUTO_REJECT;
      } else {
        if (
          !Number.isNaN(estimates.afterBuy) &&
          (positionWithBuy.quantity > 0
            ? estimates.afterBuy >= markPrice
            : estimates.afterBuy <= markPrice)
        ) {
          estimates.afterBuy = AUTO_LIQUIDATION;
        } else if (Number.isNaN(estimates.afterBuy)) {
          estimates.afterBuy = undefined;
        }
      }
      if (positionWithSell.quantity === 0) {
        estimates.afterSell = CLOSE_OUT;
      } else if (bufferedSize.isGreaterThan(maxSell)) {
        estimates.afterSell = AUTO_REJECT;
      } else {
        if (
          !Number.isNaN(estimates.afterSell) &&
          (positionWithSell.quantity < 0
            ? estimates.afterSell <= markPrice
            : estimates.afterSell >= markPrice)
        ) {
          estimates.afterSell = AUTO_LIQUIDATION;
        } else if (Number.isNaN(estimates.afterSell)) {
          estimates.afterSell = undefined;
        }
      }

      return estimates;
    }
  );

export const selectEffectiveLeverageGivenPosition = createMarkedSelector(
  'selectEffectiveLeverageGivenPosition',
  selectPositionsMarked,
  selectNlv,
  (_state, contractCode) => contractCode,
  (_state, _contractCode, quantity) => quantity,
  (_state, _contractCode, _quantity, marketValue) => marketValue,
  (posMarked, nlv, contractCode, quantity, marketValue) => {
    if (!posMarked.length) {
      return BigNumber(marketValue)
        .dividedBy(nlv)
        .dp(0)
        .toNumber();
    }

    const contractInPositions = !!posMarked[contractCode];
    let totalMV = Object.values(posMarked).reduce(
      (sum, { quantity: posQuantity, marketValue: posMarketValue, contractCode: posContract }) => {
        if (contractCode !== posContract) {
          return sum.plus(posMarketValue);
        }
        if (BigNumber(quantity).s === BigNumber(posQuantity).s) {
          return sum.plus(marketValue).plus(posMarketValue);
        }
        return sum.plus(
          BigNumber(posMarketValue)
            .minus(marketValue)
            .abs()
        );
      },
      BigNumber(0)
    );

    if (!contractInPositions) {
      totalMV = totalMV.plus(marketValue);
    }

    return totalMV
      .dividedBy(nlv)
      .dp(0)
      .toNumber();
  }
);

export const selectContractEffectiveLeverage = createMarkedSelector(
  'selectContractEffectiveLeverage',
  selectPositionMarked, // requires prop: contractCode
  selectNlv,
  (posMarked, nlv) =>
    posMarked &&
    BigNumber(posMarked.marketValue)
      .dividedBy(nlv)
      .dp(2)
      .toNumber()
);

/**
 * SAGAS
 */
function* submitOrder({ payload: data }) {
  yield put(
    sendMessageAction({
      channel: WS_CHANNELS.TRADING,
      type: WS_MESSAGE_TYPES.REQUEST,
      action: 'create-order',
      data,
    })
  );
}

export function* orderEntrySaga() {
  yield takeEvery(SUBMIT_ORDER, submitOrder);
}
