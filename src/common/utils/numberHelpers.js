import BigNumber from 'bignumber.js';

export const toPriceString = (price, decimalPlaces = 2) => BigNumber(price).toFixed(decimalPlaces);

export const toQuantityString = (quantity, decimalPlaces = 4) =>
  BigNumber(quantity).toFixed(decimalPlaces);

export const toFraction = (numerator, denominator) => BigNumber(numerator).dividedBy(denominator);

export const toFractionFloat = (numerator, denominator, decimalPlaces = 2) =>
  toFraction(numerator, denominator)
    .decimalPlaces(decimalPlaces)
    .toNumber();

export const toPercentageFloat = (numerator, denominator, decimalPlaces = 2) =>
  toFraction(numerator, denominator)
    .multipliedBy(100)
    .decimalPlaces(decimalPlaces)
    .toNumber();

export const convertDictValsToBigNumber = (dict, valueKeys) => {
  const map = { ...dict };
  valueKeys.forEach(key => {
    map[key] = BigNumber(map[key]);
  });
  return map;
};
