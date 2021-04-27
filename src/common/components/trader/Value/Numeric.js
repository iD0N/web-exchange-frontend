import React, { memo } from 'react';
import PropTypes from 'prop-types';
import numbro from 'numbro';
import BigNumber from 'bignumber.js';
import cn from 'classnames';

import { DIRECTION } from '../../../enums';
import FontIcon from '../../FontIcon';

import EnsureValuePropDefined from './EnsureValuePropDefined';
import Text from './Text';

const EnsureNumericValuePropDefined = EnsureValuePropDefined(
  value => BigNumber(value).isFinite() && !Number.isNaN(Number(value))
);

const extractIntegerAndFloat = (value, decimals) => {
  const parts = String(value).split('.');
  let float = (parts[1] || '').substring(0, decimals);
  if (float.length !== decimals) {
    float =
      float +
      Array(decimals - float.length)
        .fill('0')
        .join('');
  }

  return { integer: parts[0], float };
};

const FORMATTERS = {
  currency: (value, { abbreviated, prefix = 'USD ', noPrefix, decimals = 2 }) =>
    numbro(
      BigNumber(value)
        .dp(decimals)
        .isZero()
        ? 0
        : value
    ).format({
      thousandSeparated: !abbreviated,
      mantissa: decimals,
      prefix: noPrefix ? '' : prefix,
      ...(abbreviated ? { totalLength: calcUsdTotalLength(numbro(value).value()) } : {}),
    }),
  fee: (value, { abbreviated, prefix = 'USD ', noPrefix, decimals = 2 }) => {
    if (BigNumber(value).isGreaterThan(0)) {
      const str = FORMATTERS.currency(value, {
        abbreviated,
        prefix,
        noPrefix,
        decimals: decimals,
        thousandSeparated: !abbreviated,
      });
      return `+${str}`;
    } else {
      return FORMATTERS.currency(
        BigNumber(value)
          .abs()
          .toNumber(),
        { abbreviated, prefix, noPrefix, decimals: decimals || 2 }
      );
    }
  },
  percentage: (value, { decimals = 2 }) =>
    BigNumber(value).isZero()
      ? `0.${Array(decimals)
          .fill('0')
          .join('')}%`
      : numbro(value).format({
          thousandSeparated: true,
          output: 'percent',
          mantissa: decimals,
          // optionalMantissa: true,
        }),
  price: (value, { decimals = 2 }) =>
    numbro(value).format({
      thousandSeparated: true,
      mantissa: decimals,
    }),
  quantity: (value, { decimals = 4 }) => {
    if (decimals >= 18) {
      const { integer, float } = extractIntegerAndFloat(value, decimals);
      return [integer, float].join('.');
    }
    return numbro(value).format({
      thousandSeparated: true,
      mantissa: decimals,
    });
  },
  size: (value, { decimals = 4 }) => {
    if (decimals >= 18) {
      const { integer, float } = extractIntegerAndFloat(value, decimals);
      const integerStr = numbro(integer).format({
        thousandSeparated: true,
        mantissa: 0,
      });
      return [integerStr, float].join('.');
    }
    return numbro(value).format({
      thousandSeparated: true,
      mantissa: decimals,
    });
  },
  token: (value, { decimals = 8, noPrefix, token = 'BTC' }) =>
    numbro(value).formatCurrency({
      thousandSeparated: true,
      optionalMantissa: false,
      trimMantissa: false,
      mantissa: decimals,
      currencyPosition: 'postfix',
      currencySymbol: !noPrefix ? token : undefined,
      spaceSeparated: true,
    }),
};

const numericFormatter = (value, type, options = {}) => FORMATTERS[type](value, options);

const NumericValue = ({
  abbreviated,
  autoDecimals,
  className,
  decimals: _decimals,
  direction,
  noPrefix,
  prefix,
  token,
  type,
  value: _value,
  withDirection,
  withIcon,
  withSign,
  ...bag
}) => {
  const value = _value.toString ? _value.toString() : _value; // coerce BigNumber or autoDecimals
  const decimals = autoDecimals
    ? value && value.split && value.split('.') && value.split('.')[1]
      ? value.split('.')[1].length
      : undefined
    : _decimals;

  let renderedValue = null;
  try {
    renderedValue = numericFormatter(value, type, {
      abbreviated,
      decimals,
      noPrefix,
      prefix,
      token,
    });
  } catch (err) {}

  return (
    <Text
      className={cn(className, withDirection ? getDirection({ value, decimals, type }) : direction)}
      {...bag}
    >
      {withSign && value > 0 && '+'}
      {renderedValue}
      {(direction || withDirection) && withIcon && <FontIcon type={`arrow-${direction}`} />}
    </Text>
  );
};

NumericValue.propTypes = {
  abbreviated: PropTypes.bool,
  className: PropTypes.string,
  decimals: PropTypes.number,
  direction: PropTypes.oneOf([DIRECTION.UP, DIRECTION.DOWN]),
  noPrefix: PropTypes.bool,
  prefix: PropTypes.string,
  token: PropTypes.string,
  type: PropTypes.oneOf(Object.keys(FORMATTERS)).isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  withDirection: PropTypes.bool,
  withIcon: PropTypes.bool,
  withSign: PropTypes.bool,
};

export default memo(EnsureNumericValuePropDefined(NumericValue));

function getDirection({ value, decimals = 2, type }) {
  return BigNumber(value)
    .dp(decimals + (type === 'percentage' ? 2 : 0))
    .isZero()
    ? undefined
    : BigNumber(value)
        .dp(decimals)
        .isPositive()
    ? DIRECTION.UP
    : type !== 'fee'
    ? DIRECTION.DOWN
    : undefined;
}

function calcUsdTotalLength(value, maxLength = 3) {
  return Math.abs(value) >= 10 && Math.abs(value) < 100
    ? value < 0
      ? 5
      : 4
    : value < 0
    ? maxLength + 1
    : maxLength;
}
