import { Component } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import { PAGINATION_HEIGHT, MIN_PAGE_SIZE } from '../../constants';

export default class AutoPagination extends Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
    rowHeight: PropTypes.number.isRequired,
    tableBodyHeight: PropTypes.number.isRequired,
    dataSource: PropTypes.array.isRequired,
  };

  state = {
    pageSize: Infinity,
    hasPagination: false,
  };

  componentDidUpdate(prevProps, prevState) {
    const { dataSource, rowHeight, tableBodyHeight } = this.props;

    if (
      tableBodyHeight !== prevProps.tableBodyHeight ||
      dataSource.length !== prevProps.dataSource.length ||
      rowHeight !== prevProps.rowHeight
    ) {
      this.updatePagination();
    }
  }

  updatePagination() {
    const { dataSource, rowHeight, tableBodyHeight } = this.props;

    const maxBodyHeight = this.state.hasPagination
      ? tableBodyHeight + PAGINATION_HEIGHT
      : tableBodyHeight;

    const hasPagination =
      Math.max(MIN_PAGE_SIZE, Math.floor(maxBodyHeight / rowHeight)) < dataSource.length;

    this.setState({
      pageSize: !hasPagination
        ? dataSource.length
        : Math.max(MIN_PAGE_SIZE, Math.floor((maxBodyHeight - PAGINATION_HEIGHT) / rowHeight)),
      hasPagination,
    });
  }

  render() {
    const { dataSource } = this.props;
    const { pageSize, hasPagination } = this.state;

    const wasMeasured = pageSize !== Infinity;

    return this.props.children({
      pageSize,
      hasPagination,
      dataSource: wasMeasured ? dataSource : [],
      className: cn('trader-table-auto-pagination', {
        'trader-table-with-pagination': hasPagination,
        'trader-table-auto-pagination-measured': wasMeasured,
      }),
    });
  }
}
