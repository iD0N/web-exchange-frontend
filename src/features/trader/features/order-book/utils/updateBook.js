import { ZERO_SIZE_STRING } from '../../../constants';

import { pickLevelPriceInt, pickLevelSize } from './helpers';

// We use separate functions for bids and ask updates because both
// are naturally sorted/rendered high to low, but the majority
// of updates will occur near the spread (low values for ask, high for low).
// This means we should iterate and modify these arrays in opposite directions
// ie low to high for asks, high to low for bids, as to break out of the loops asap

export const insertAllChangesAsLevels = changes =>
  changes
    .filter(level => pickLevelSize(level) !== ZERO_SIZE_STRING)
    .sort((a, b) => pickLevelPriceInt(b) - pickLevelPriceInt(a));

export const updateOrInsertAsks = (changes, levels) => {
  const stack = [...levels];
  const result = [];

  changes.sort((a, b) => pickLevelPriceInt(a) - pickLevelPriceInt(b));

  while (changes.length && stack.length) {
    const [change] = changes;

    while (stack.length && changes.length) {
      const [level] = stack.slice(-1);
      const changePrice = pickLevelPriceInt(change);
      const levelPrice = pickLevelPriceInt(level);

      if (changePrice === levelPrice) {
        result.unshift(changes.shift());
        stack.pop();
        break;
      } else if (changePrice < levelPrice) {
        result.unshift(changes.shift());
        break;
      } else {
        // not found, continue to iterate
        result.unshift(stack.pop());
      }
    }
  }

  changes.reverse();

  return [...changes, ...stack, ...result];
};

export const updateOrInsertBids = (changes, levels) => {
  const stack = [...levels];
  const result = [];

  changes.sort((a, b) => pickLevelPriceInt(b) - pickLevelPriceInt(a));

  while (changes.length && stack.length) {
    const [change] = changes;

    while (stack.length) {
      const [level] = stack;
      const changePrice = pickLevelPriceInt(change);
      const levelPrice = pickLevelPriceInt(level);

      if (changePrice === levelPrice) {
        result.push(changes.shift());
        stack.shift();
        break;
      } else if (changePrice > levelPrice) {
        result.push(changes.shift());
        break;
      } else {
        // not found, continue to iterate
        result.push(stack.shift());
      }
    }
  }

  return [...result, ...stack, ...changes];
};
