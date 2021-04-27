import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';
import BigNumber from 'bignumber.js';
import cn from 'classnames';

import { ORDER_SIDE } from '../../../../../common/enums';
import { Currency, Tooltip, Value } from '../../../../../common/components/trader';

const ONE_BILLION = 1000000000;

const mapStateToProps = (state, ownProps) => {
  const {
    estimate: { canBuy, canSell },
    inputSize,
  } = ownProps;

  let priceEst = { canBuyPrice: undefined, canSellPrice: undefined };
  if (!!inputSize) {
    priceEst.canBuyPrice = canBuy != null
      ? BigNumber(canBuy)
          .dividedBy(inputSize)
          .toNumber()
      : undefined;
    priceEst.canSellPrice = canSell != null
      ? BigNumber(canSell)
          .dividedBy(inputSize)
          .toNumber()
      : undefined;
  }

  return {
    priceEst,
  };
};

const NotionalEstimateValue = ({
  contractCode,
  estimate: { canBuy, canSell, sizeExceedsAsks, sizeExceedsBids },
  priceEst: { canBuyPrice, canSellPrice },
  modifyOrderSide,
  priceDecimals,
  quoteCurrency,
  t,
}) =>
  (canBuy != null || canSell != null) && (
    <>
      <div className="size-estimate-wrapper">
        {canBuy != null && (!modifyOrderSide || modifyOrderSide === ORDER_SIDE.BUY) && (
          <div className="size-estimate-buy">
            <Value
              label={
                <>
                  <Trans i18nKey="trader.orderEntry.estBuyNotional">Est. Buy Value</Trans>{' '}
                  <Currency value={quoteCurrency} />
                </>
              }
            >
              {'≈ '}
              {!Number.isNaN(canBuy) && canBuy < ONE_BILLION ? (
                <Value.Numeric
                  type="currency"
                  noPrefix
                  decimals={priceDecimals}
                  value={Number.isNaN(canBuy) ? 0 : canBuy}
                />
              ) : (
                <Tooltip
                  title={
                    <Value.Numeric
                      type="currency"
                      noPrefix
                      decimals={priceDecimals}
                      value={Number.isNaN(canBuy) ? 0 : canBuy}
                    />
                  }
                >
                  <Value.Numeric
                    type="currency"
                    noPrefix
                    abbreviated
                    decimals={priceDecimals}
                    value={Number.isNaN(canBuy) ? 0 : canBuy}
                  />
                </Tooltip>
              )}
            </Value>
          </div>
        )}
        {canSell != null && (!modifyOrderSide || modifyOrderSide === ORDER_SIDE.SELL) && (
          <div className="size-estimate-sell">
            <Value
              label={
                <>
                  <Trans i18nKey="trader.orderEntry.estSellNotional">Est. Sell Value</Trans>{' '}
                  <Currency value={quoteCurrency} />
                </>
              }
            >
              {'≈ '}
              {!Number.isNaN(canSell) && canSell < ONE_BILLION ? (
                <Value.Numeric
                  type="currency"
                  noPrefix
                  decimals={priceDecimals}
                  value={Number.isNaN(canSell) ? 0 : canSell}
                />
              ) : (
                <Tooltip
                  title={
                    <Value.Numeric
                      type="currency"
                      noPrefix
                      decimals={priceDecimals}
                      value={Number.isNaN(canSell) ? 0 : canSell}
                    />
                  }
                >
                  <Value.Numeric
                    type="currency"
                    noPrefix
                    abbreviated
                    decimals={priceDecimals}
                    value={Number.isNaN(canSell) ? 0 : canSell}
                  />
                </Tooltip>
              )}
            </Value>
          </div>
        )}
      </div>
      {(canBuyPrice != null || canSellPrice != null) && (
        <div className="size-estimate-wrapper">
          {canBuyPrice != null && (!modifyOrderSide || modifyOrderSide === ORDER_SIDE.BUY) && (
            <div className={cn('size-estimate-buy', { 'red-negative': sizeExceedsAsks })}>
              <Value
                label={
                  <>
                    <Trans i18nKey="trader.orderEntry.estBuyPrice">Est. Buy Price</Trans>{' '}
                    <Currency value={quoteCurrency} />
                  </>
                }
              >
                {'≈ '}
                {!Number.isNaN(canBuyPrice) && canBuyPrice < ONE_BILLION ? (
                  <Value.Numeric
                    type="currency"
                    noPrefix
                    decimals={priceDecimals}
                    value={Number.isNaN(canBuyPrice) ? 0 : canBuyPrice}
                  />
                ) : (
                  <Tooltip
                    title={
                      <Value.Numeric
                        type="currency"
                        noPrefix
                        decimals={priceDecimals}
                        value={Number.isNaN(canBuyPrice) ? 0 : canBuyPrice}
                      />
                    }
                  >
                    <Value.Numeric
                      type="currency"
                      noPrefix
                      abbreviated
                      decimals={priceDecimals}
                      value={Number.isNaN(canBuyPrice) ? 0 : canBuyPrice}
                    />
                  </Tooltip>
                )}
              </Value>
            </div>
          )}
          {canSellPrice != null && (!modifyOrderSide || modifyOrderSide === ORDER_SIDE.SELL) && (
            <div className={cn('size-estimate-sell', { 'red-negative': sizeExceedsBids })}>
              <Value
                label={
                  <>
                    <Trans i18nKey="trader.orderEntry.estSellPricel">Est. Sell Price</Trans>{' '}
                    <Currency value={quoteCurrency} />
                  </>
                }
              >
                {'≈ '}
                {!Number.isNaN(canSellPrice) && canSellPrice < ONE_BILLION ? (
                  <Value.Numeric
                    type="currency"
                    noPrefix
                    decimals={priceDecimals}
                    value={Number.isNaN(canSellPrice) ? 0 : canSellPrice}
                  />
                ) : (
                  <Tooltip
                    title={
                      <Value.Numeric
                        type="currency"
                        noPrefix
                        decimals={priceDecimals}
                        value={Number.isNaN(canSellPrice) ? 0 : canSellPrice}
                      />
                    }
                  >
                    <Value.Numeric
                      type="currency"
                      noPrefix
                      abbreviated
                      decimals={priceDecimals}
                      value={Number.isNaN(canSellPrice) ? 0 : canSellPrice}
                    />
                  </Tooltip>
                )}
              </Value>
            </div>
          )}
        </div>
      )}
    </>
  );

NotionalEstimateValue.propTypes = {
  contractCode: PropTypes.string.isRequired,
  modifyOrderSide: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  estimate: PropTypes.object.isRequired,
  t: PropTypes.func,
};

export default memo(connect(mapStateToProps)(NotionalEstimateValue));
