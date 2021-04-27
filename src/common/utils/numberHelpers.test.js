import { toPriceString, toQuantityString } from './numberHelpers';

describe('common/utils/numberHelpers.js', () => {
  describe('#toPriceString', () => {
    const price1 = 99;
    const price2 = 99.9;
    const price3 = 99.99;

    it('should take a number and return the string with 2 decimal spaces', () => {
      expect(toPriceString(price1)).toBe('99.00');
      expect(toPriceString(price2)).toBe('99.90');
      expect(toPriceString(price3)).toBe('99.99');
    });
  });

  describe('#toQuantityString', () => {
    const quantity1 = 99;
    const quantity2 = 99.9;
    const quantity3 = 99.99;

    it('should take a number and return the string with 4 decimal spaces', () => {
      expect(toQuantityString(quantity1)).toBe('99.0000');
      expect(toQuantityString(quantity2)).toBe('99.9000');
      expect(toQuantityString(quantity3)).toBe('99.9900');
    });
  });
});
