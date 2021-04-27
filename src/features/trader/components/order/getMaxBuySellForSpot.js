import BigNumber from 'bignumber.js';
import { isOfLimitOrderType } from '../../features/orders/utils';

// round quantities toward zero below to be conservative (so suggested order
// sizes aren't rejected)
const toNum = (bn, decs) => bn.dp(decs, BigNumber.ROUND_DOWN).toNumber();

export default function getMaxBuySellForSpot(
  inputPrice,
  orderType,
  isPostOnly,
  quoteCurrency,
  priceDecimals,
  sizeDecimals,
  underlying,
  modifyOrderSide,
  modifyOrderQuantity,
  modifyOrderPrice,
  makerFee,
  takerFee,
  underlyingFreeBalance,
  quoteCurrencyFreeBalance,
  contractData,
  tickerDataForContract,
) {
  const modifyOrderSize = (modifyOrderQuantity || BigNumber(0)).abs();

  const makerFeePlusOne = BigNumber(makerFee).plus(1);
  const takerFeePlusOne = BigNumber(takerFee).plus(1);
  const feePlusOne = isPostOnly ? makerFeePlusOne : takerFeePlusOne;

  // in the case of a modify, the free balances already have holds for this order netted out, so
  // we'll add that amount back on
  let underlyingBalance;
  let quoteCurrencyBalance;
  if (modifyOrderSide == null) {
    underlyingBalance = BigNumber(underlyingFreeBalance);
    quoteCurrencyBalance = BigNumber(quoteCurrencyFreeBalance);
  } else if (modifyOrderSide === 'buy') {
    underlyingBalance = BigNumber(underlyingFreeBalance);
    quoteCurrencyBalance = BigNumber(quoteCurrencyFreeBalance).plus(
      modifyOrderSize.times(modifyOrderPrice).times(makerFeePlusOne)
    );
  } else if (modifyOrderSide === 'sell') {
    underlyingBalance = BigNumber(underlyingFreeBalance).plus(modifyOrderSize.times(makerFeePlusOne));
    quoteCurrencyBalance = BigNumber(quoteCurrencyFreeBalance);
  } else {
    throw Error(`Unexpected modifyOrderSide: ${modifyOrderSide}`);
  }

  const isLimit = isOfLimitOrderType(orderType);

  let buyPrice;
  let sellPrice;
  if (isLimit) { // limit order
    buyPrice = BigNumber(inputPrice);
    sellPrice = BigNumber(inputPrice);
  } else { // market order
    const { priceBandThresholdMarket: offset } = contractData;
    const { askPrice, bidPrice } = tickerDataForContract;
    buyPrice = BigNumber(askPrice).times(BigNumber(1).plus(offset));
    sellPrice = BigNumber(bidPrice).times(BigNumber(1).minus(offset));
  }
  const buyPriceWithFee = toNum(buyPrice.times(feePlusOne), priceDecimals);

  const maxQuantityBuy = toNum(quoteCurrencyBalance.div(buyPriceWithFee), sizeDecimals);
  const maxQuantitySell = toNum(underlyingBalance, sizeDecimals);
  const maxNotionalBuy = toNum(buyPrice.times(maxQuantityBuy), priceDecimals);
  const maxNotionalSell = toNum(sellPrice.times(underlyingBalance), priceDecimals);

  return {
    quantity: { buy: maxQuantityBuy, sell: maxQuantitySell },
    notional: { buy: maxNotionalBuy, sell: maxNotionalSell },
  };
}
