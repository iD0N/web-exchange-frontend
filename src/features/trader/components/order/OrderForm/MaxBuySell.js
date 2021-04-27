import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';
import cn from 'classnames';

import { toQuantityString } from '../../../../../common/utils/numberHelpers';
import { Value } from '../../../../../common/components/trader';
import { CONTRACT_TYPE, ORDER_SIDE } from '../../../../../common/enums';
import { selectContractByCode } from '../../../data-store/ducks';
import { selectTokenFreeBalance } from '../../../features/positions/components/BalancesTable/ducks';
import getMaxBuySellForSpot from '../getMaxBuySellForSpot';

const makeMapStateToProps = () => {
  return (state, ownProps) => {
    if (ownProps.type !== CONTRACT_TYPE.SPOT) return { max: ownProps.maxBuySell };

    // spot contracts

    const {
      contractCode,
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
    } = ownProps;

    const { makerFee, takerFee } = selectContractByCode(state, contractCode);
    const underlyingFreeBalance = selectTokenFreeBalance(state, underlying);
    const quoteCurrencyFreeBalance = selectTokenFreeBalance(state, quoteCurrency);

    return { max: getMaxBuySellForSpot(
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
      state.traderDataStore.contracts.byId[contractCode],
      state.traderDataStore.tickerData[contractCode],
    ) };
  };
};

const MaxBuySell = ({ decimals, onChange, max, sizeType, modifyOrderSide }) =>
  !!max[sizeType] && (
    <div className="max-buy-sell-wrapper">
      {!modifyOrderSide || modifyOrderSide === ORDER_SIDE.BUY ? (
        <div
          className={cn('max-size', 'select-disabled', {
            'max-size-clickable': max[sizeType].buy > 0,
          })}
          onClick={() =>
            max[sizeType].buy > 0 && onChange(toQuantityString(max[sizeType].buy, decimals))
          }
        >
          <Trans i18nKey="trader.orderEntry.maxBuy">Max Buy: </Trans>
          {max[sizeType].buy > 0 ? (
            <Value.Numeric type="size" noPrefix decimals={decimals} value={max[sizeType].buy} />
          ) : (
            <Trans i18nKey="trader.orderEntry.maxNA">N/A</Trans>
          )}
        </div>
      ) : null}
      {!modifyOrderSide || modifyOrderSide === ORDER_SIDE.SELL ? (
        <div
          className={cn('max-size', 'select-disabled', {
            'max-size-clickable': max[sizeType].sell > 0,
          })}
          onClick={() =>
            max[sizeType].sell > 0 && onChange(toQuantityString(max[sizeType].sell, decimals))
          }
        >
          <Trans i18nKey="trader.orderEntry.maxSell">Max Sell: </Trans>
          {max[sizeType].sell > 0 ? (
            <Value.Numeric type="size" noPrefix decimals={decimals} value={max[sizeType].sell} />
          ) : (
            <Trans i18nKey="trader.orderEntry.maxNA">N/A</Trans>
          )}
        </div>
      ) : null}
    </div>
  );

MaxBuySell.propTypes = {
  contractCode: PropTypes.string.isRequired,
  decimals: PropTypes.number.isRequired,
  maxBuySell: PropTypes.object.isRequired,
  max: PropTypes.object.isRequired,
  sizeType: PropTypes.string.isRequired,
  modifyOrderSide: PropTypes.string,
};

export default memo(connect(makeMapStateToProps)(MaxBuySell));
