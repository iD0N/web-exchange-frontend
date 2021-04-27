import React, { memo } from 'react';
import { translate, Trans } from 'react-i18next';
import PropTypes from 'prop-types';
import cn from 'classnames';
import BigNumber from 'bignumber.js';

import { ORDER_SIDE, ORDER_TYPE } from '../../../../../common/enums';
import { InfoTooltip, Value } from '../../../../../common/components/trader';
import { AUTO_LIQUIDATION, AUTO_REJECT, CLOSE_OUT } from '../../../features/order-entry/constants';

const LiquidationValue = ({ priceDecimals, t, value }) =>
  !value ? (
    <InfoTooltip
      title={t('trader.positions.liquidationPriceTooltip', {
        defaultValue:
          'Changes in the price of this contract will not independently result in liquidation if this is the only position held.',
      })}
    >
      <Trans i18nKey="trader.orderEntry.maxNA">N/A</Trans>
    </InfoTooltip>
  ) : value === AUTO_LIQUIDATION ? (
    <InfoTooltip
      title={t('trader.orderEntry.autoliquidationTooltip', {
        defaultValue: 'Placing this order will result in automatic account liquidation.',
      })}
    >
      <span className="auto-liquidation">
        <Trans i18nKey="trader.orderEntry.autoliquidation">Auto-liquidation</Trans>
      </span>
    </InfoTooltip>
  ) : value === AUTO_REJECT || value === CLOSE_OUT ? null : (
    <Value.Numeric type="currency" decimals={priceDecimals} value={value} />
  );

const EstLiquidationValues = ({
  liqEstimates: { afterBuy, afterSell },
  modifyOrderSide,
  orderType,
  priceDecimals,
  size,
  t,
}) =>
  !!size &&
  !BigNumber(size).isZero() &&
  (orderType === ORDER_TYPE.MARKET || orderType === ORDER_TYPE.LIMIT) &&
  !Number.isNaN(afterBuy) &&
  !Number.isNaN(afterSell) && (
    <div className="size-estimate-wrapper">
      {!modifyOrderSide || modifyOrderSide === ORDER_SIDE.BUY ? (
        <div
          className={cn('size-estimate-buy', {
            'liq-estimate-hidden':
              (afterBuy === AUTO_LIQUIDATION && orderType === ORDER_TYPE.LIMIT) ||
              afterBuy === CLOSE_OUT ||
              afterBuy === AUTO_REJECT,
          })}
        >
          <Value
            label={<Trans i18nKey="trader.orderEntry.estLiqPriceBuy">Est. Liq. Price - Buy</Trans>}
          >
            <LiquidationValue
              orderType={orderType}
              priceDecimals={priceDecimals}
              t={t}
              value={afterBuy}
            />
          </Value>
        </div>
      ) : null}
      {!modifyOrderSide || modifyOrderSide === ORDER_SIDE.SELL ? (
        <div
          className={cn('size-estimate-sell', {
            'liq-estimate-hidden':
              (afterSell === AUTO_LIQUIDATION && orderType === ORDER_TYPE.LIMIT) ||
              afterSell === CLOSE_OUT ||
              afterSell === AUTO_REJECT,
            'size-estimate-sell-modify': !!modifyOrderSide,
          })}
        >
          <Value
            label={
              <Trans i18nKey="trader.orderEntry.estLiqPriceSell">Est. Liq. Price - Sell</Trans>
            }
          >
            <LiquidationValue
              orderType={orderType}
              priceDecimals={priceDecimals}
              t={t}
              value={afterSell}
            />
          </Value>
        </div>
      ) : null}
    </div>
  );

EstLiquidationValues.propTypes = {
  modifyOrderSide: PropTypes.string,
  liqEstimates: PropTypes.object.isRequired,
};

export default memo(translate()(EstLiquidationValues));
