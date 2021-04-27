import { findRightIndexAtCondition } from './helpers';

describe('common/utils/helpers.js', () => {
  describe('#findRightIndexAtCondition', () => {
    it('should return the last index passing the condition', () => {
      expect(findRightIndexAtCondition(a => 3)([1, 2, 3, 4, 5])).toBe(4);
    });
  });
});
