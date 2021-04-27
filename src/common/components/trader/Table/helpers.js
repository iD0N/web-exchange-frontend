import BigNumber from 'bignumber.js';

import { AUTO_PAGINATION } from './constants';

const sortableColumn = compare => ({ dataIndex, ...col }) => ({
  dataIndex,
  ...col,
  sorter: (a, b) => compare(a[dataIndex], b[dataIndex]),
});

export const sortableColumns = {
  age: sortableColumn((a, b) => new Date(b) - new Date(a)),
  date: sortableColumn((a, b) => new Date(a) - new Date(b)),
  number: sortableColumn((a, b) => a - b),
  string: sortableColumn((a, b) => (a || '').localeCompare(b)),
};

export function checkSortKey(sortKey, id) {
  if (typeof sortKey !== 'string') {
    console.warn(`defaultSortKey is missing on table '${id}'`);
  }
}

export function checkPageSize(pageSize, id) {
  if (pageSize !== AUTO_PAGINATION && !BigNumber(pageSize).isInteger() && pageSize !== Infinity) {
    console.warn(`pageSize prop in table '${id}' must be ${AUTO_PAGINATION}, integer or Infinity`);
  }
}

export function isSortElement(element) {
  const isThead = ({ tagName }) => tagName === 'THEAD';
  const matchesClass = ({ className }) => className === 'trader-table-column-sorters';

  return (
    !isThead(element) &&
    (matchesClass(element) || (element.parentElement && isSortElement(element.parentElement)))
  );
}

/**
 * Every column has to have unique dataIndex or key specified
 */
export function checkColumnKeys(columns, id) {
  columns.reduce((keys, col, idx) => {
    const key = getColumnKey(col);

    if (key === undefined) {
      console.warn(`Missing key on column with index '${idx}' in table '${id}'`);
      return keys;
    }

    if (keys[key]) {
      console.warn(
        `Column with dataIndex '${col.dataIndex}' and key '${col.key}' does not have a unique key in table '${id}'`
      );
    }

    return { ...keys, [key]: true };
  }, {});
}

export function getColumnKey({ key, dataIndex }) {
  return key || dataIndex;
}
