import React from 'react';
import PropTypes from 'prop-types';

import { AUTO_PAGINATION } from '../../constants';
import AutoPagination from './AutoPagination';
import SimplePagination from './SimplePagination';

const PaginationEnhancer = ({
  children,
  pageSize,
  rowHeight,
  rowCount,
  dataSource,
  tableBodyHeight,
}) =>
  pageSize === AUTO_PAGINATION ? (
    <AutoPagination
      children={children}
      pageSize={pageSize}
      dataSource={dataSource}
      rowHeight={rowHeight}
      rowCount={rowCount}
      tableBodyHeight={tableBodyHeight}
    />
  ) : (
    <SimplePagination children={children} pageSize={pageSize} rowCount={rowCount} />
  );

PaginationEnhancer.propTypes = {
  children: PropTypes.func.isRequired,
  pageSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  rowHeight: PropTypes.number.isRequired,
  rowCount: PropTypes.number.isRequired,
  dataSource: PropTypes.array.isRequired,
  tableBodyHeight: PropTypes.number.isRequired,
};

export default PaginationEnhancer;
