import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import { ORDER_SIDE } from '../../../../../common/enums';
import { Tooltip, Value } from '../../../../../common/components/trader';

const ONE_BILLION = 1000000000;

const SizeEstimateValue = ({
  contractCode,
  estimate: { canBuy, canSell },
  underlying,
  modifyOrderSide,
  sizeDecimals,
  t,
}) =>
  (
    <>
      <div className="size-estimate-wrapper">
        <div className="size-estimate-buy">
          {canBuy != null && (!modifyOrderSide || modifyOrderSide === ORDER_SIDE.BUY) && (
            <Value
              label={t('trader.orderEntry.estBuyQty', {
                defaultValue: `Est. Buy. Qty. (${underlying})`,
                contractCode: underlying,
              })}
            >
              {'≈ '}
              {!Number.isNaN(canBuy) && canBuy < ONE_BILLION ? (
                <Value.Numeric
                  type="size"
                  decimals={sizeDecimals}
                  noPrefix
                  value={Number.isNaN(canBuy) ? 0 : canBuy}
                />
              ) : (
                <Tooltip
                  title={
                    <Value.Numeric
                      type="size"
                      decimals={sizeDecimals}
                      noPrefix
                      value={Number.isNaN(canBuy) ? 0 : canBuy}
                    />
                  }
                >
                  <Value.Numeric
                    type="currency"
                    noPrefix
                    abbreviated
                    decimals={sizeDecimals}
                    value={Number.isNaN(canBuy) ? 0 : canBuy}
                  />
                </Tooltip>
              )}
            </Value>
          )}
        </div>
        <div className="size-estimate-sell">
          {canSell != null && (!modifyOrderSide || modifyOrderSide === ORDER_SIDE.SELL) && (
            <Value
              label={t('trader.orderEntry.estSellQty', {
                defaultValue: `Est. Sell. Qty. (${underlying})`,
                contractCode: underlying,
              })}
            >
              {'≈ '}
              {!Number.isNaN(canSell) && canSell < ONE_BILLION ? (
                <Value.Numeric
                  type="size"
                  decimals={sizeDecimals}
                  noPrefix
                  value={Number.isNaN(canSell) ? 0 : canSell}
                />
              ) : (
                <Tooltip
                  title={
                    <Value.Numeric
                      type="size"
                      noPrefix
                      decimals={sizeDecimals}
                      value={Number.isNaN(canSell) ? 0 : canSell}
                    />
                  }
                >
                  <Value.Numeric
                    type="currency"
                    noPrefix
                    abbreviated
                    decimals={sizeDecimals}
                    value={Number.isNaN(canSell) ? 0 : canSell}
                  />
                </Tooltip>
              )}
            </Value>
          )}
        </div>
      </div>
    </>
  );

SizeEstimateValue.propTypes = {
  contractCode: PropTypes.string.isRequired,
  underlying: PropTypes.string.isRequired,
  modifyOrderSide: PropTypes.string,
  notional: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  estimate: PropTypes.object.isRequired,
  t: PropTypes.func,
};

export default memo(translate()(SizeEstimateValue));
