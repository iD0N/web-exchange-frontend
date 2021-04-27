export const findRightIndexAtCondition = condition => arr => {
  let i = arr.length;
  let idx = -1;

  while (i--) {
    if (condition(arr[i])) {
      idx = i;
      break;
    }
  }

  return idx;
};
