import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import BigNumber from 'bignumber.js';

import { ZERO_SIZE_STRING } from '../../../constants';
import { t } from '../../../../../common/services/i18n';
import { CONTRACT_TYPE } from '../../../../../common/enums';
import { toQuantityString } from '../../../../../common/utils/numberHelpers';
import { FormItem, InputNumber, Value } from '../../../../../common/components/trader';
import { selectTokenBalances, selectContracts } from '../../../data-store/ducks';
import rules from '../../../../../common/rules';

const SizeInput = ({
  autoFocus,
  condensed,
  underlying,
  contractCode,
  positionQuantity,
  decimals,
  id,
  minimum,
  onChange,
  step,
  t,
  value,
}) => (
  <div className="size-input-wrapper">
    <FormItem
      className="order-entry-size-form-item"
      id={id}
      initialValue={value}
      label={
        condensed
          ? t('trader.orderEntry.quantity', {
              defaultValue: `Qty.`,
            })
          : t('trader.orderEntry.quantityContract', {
              defaultValue: `Quantity (${underlying})`,
              seriesCode: underlying,
            })
      }
      rules={[rules.positiveNumber, rules.multipleOf(minimum)]}
    >
      <InputNumber
        autoFocus={autoFocus}
        min={0}
        precision={decimals}
        placeholder={ZERO_SIZE_STRING}
        step={step}
      />
    </FormItem>
    <ConnectedPositionInput
      positionQuantity={positionQuantity}
      decimals={decimals}
      onChange={onChange}
      contractCode={contractCode}
    />
  </div>
);

SizeInput.propTypes = {
  autoFocus: PropTypes.bool.isRequired,
  condensed: PropTypes.bool,
  decimals: PropTypes.number.isRequired,
  id: PropTypes.string.isRequired,
  minimum: PropTypes.number.isRequired,
  step: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  positionQuantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

SizeInput.defaultProps = {
  autoFocus: false,
  decimals: 4,
  id: 'size',
};

const bnZero = BigNumber(0);

const mapStateToProps = (state, { decimals, contractCode, positionQuantity }) => {
  if (!contractCode) {
    return { positionQuantity: null };
  }
  const contracts = selectContracts(state);
  const isSpot = !!contracts[contractCode] && contracts[contractCode].type === CONTRACT_TYPE.SPOT;
  if (isSpot) {
    const tokenCode = contracts[contractCode].underlying;
    const tokenBalances = selectTokenBalances(state);

    // round quantity toward zero here to be conservative (so suggested order sizes aren't rejected)
    const tokenBalanceStr = tokenBalances[tokenCode.toLowerCase()];
    const tokenBalance = tokenBalanceStr
      ? BigNumber(tokenBalanceStr).dp(decimals, BigNumber.ROUND_DOWN)
      : bnZero;
    return {
      positionQuantity: tokenBalance,
      tokenCode,
      isSpot,
    };
  }
  const bnPosition = BigNumber(positionQuantity);
  return { positionQuantity: bnPosition.isFinite() && !bnPosition.isZero() ? bnPosition : bnZero };
};

const PositionInput = ({ decimals, isSpot, onChange, tokenCode, positionQuantity }) =>
  !!positionQuantity &&
  !positionQuantity.isZero() && (
    <div
      className="position-toggle"
      onClick={() => onChange(toQuantityString(positionQuantity.abs().toNumber(), decimals))}
    >
      <div className="position-toggle-label">
        {isSpot ? (
          <>
            {tokenCode} {t('trader.positions.balances.balance', { defaultValue: 'Balance' })}
          </>
        ) : (
          t('trader.positions.position', { defaultValue: 'Position' })
        )}
        :
      </div>
      <Value.Numeric
        type="size"
        decimals={decimals}
        withDirection
        value={positionQuantity.toString()}
      />
    </div>
  );

const ConnectedPositionInput = connect(mapStateToProps)(PositionInput);

export default memo(translate()(SizeInput));
