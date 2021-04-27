import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Table from 'antd/lib/table';
import { translate } from 'react-i18next';
import cn from 'classnames';
import merge from 'lodash.merge';
import memoize from 'memoize-one';
import arrayMove from 'array-move';

import { removeFromArray } from '../../../utils/reduxHelpers';
import IsMobile from '../../IsMobile';

import { SORT_ORDERS, ROW_HEIGHT } from './constants';
import {
  checkColumnKeys,
  checkSortKey,
  checkPageSize,
  getColumnKey,
  isSortElement,
} from './helpers';
import PaginationEnhancer from './components/PaginationEnhancer';
import ResizableTitle from './components/ResizableTitle';
import DraggableColumns from './components/DraggableColumns';
import ColumnsManagementModal from './components/ColumnsManagement/ColumnsManagementModal';
import ScrollableEnhancer from './components/ScrollableEnhancer';
import { ElementResizeDetector } from '../../index';

class EnhancedTable extends Component {
  static propTypes = {
    className: PropTypes.string,
    config: PropTypes.object,
    columns: PropTypes.array.isRequired,
    components: PropTypes.object,
    dataSource: PropTypes.array.isRequired,
    defaultSortKey: PropTypes.string,
    defaultSortOrder: PropTypes.oneOf(Object.values(SORT_ORDERS)),
    emptyText: PropTypes.node,
    enableColumnManagement: PropTypes.bool,
    enableColumnOrdering: PropTypes.bool,
    enableResize: PropTypes.bool,
    enableSort: PropTypes.bool,
    id: PropTypes.string.isRequired,
    isMobile: PropTypes.bool.isRequired,
    loading: PropTypes.bool,
    pageSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    rowClassName: PropTypes.func,
    rowHeight: PropTypes.number,
    rowKey: PropTypes.string.isRequired,
    showHeader: PropTypes.bool,
    t: PropTypes.func.isRequired,
    onConfigChange: PropTypes.func,
    onRow: PropTypes.func,
  };

  static defaultProps = {
    defaultSortOrder: SORT_ORDERS.DESC,
    pageSize: Infinity,
    rowHeight: ROW_HEIGHT,
    showHeader: true,
  };

  constructor(props) {
    super(props);

    this.state = {
      config: this.props.config || {},
      sortKey: this.props.defaultSortKey,
      sortOrder: this.props.defaultSortOrder,
    };

    checkColumnKeys(props.columns, props.id);
    checkPageSize(props.pageSize, props.id);

    if (this.isSortEnabled()) {
      checkSortKey(this.getSortKey(), props.id);
    }
  }

  componentDidUpdate({ config }) {
    if (this.props.config !== config) {
      this.setState({ config: this.props.config });
    }
  }

  handleDefaultConfigChange = newConfig => this.setState({ config: newConfig });

  isColumnOrderingEnabled = () => this.props.enableColumnOrdering && !this.props.isMobile;

  isResizeEnabled = () => this.props.enableResize && !this.props.isMobile;

  isSortEnabled = () => this.props.enableSort && !this.props.isMobile;

  handleConfigChange = configDiff => {
    const newConfig = {
      ...this.state.config,
      ...configDiff,
    };

    if (this.props.onConfigChange) {
      this.props.onConfigChange(newConfig);
    } else {
      this.handleDefaultConfigChange(newConfig);
    }
  };

  getComponents = memoize((components, enableResize) =>
    enableResize
      ? merge(components, {
          header: {
            cell: ResizableTitle,
          },
        })
      : components
  );

  getVisibleColumns = memoize((columns, hiddenColumnKeys) =>
    columns.filter(col => !hiddenColumnKeys.includes(getColumnKey(col)))
  );

  handleColumnVisibilityChange = columnKey => {
    const { columns } = this.props;
    const { config } = this.state;
    const { hiddenColumnKeys = [] } = config;

    const column = columns.find(col => getColumnKey(col) === columnKey);

    if (column.alwaysVisible) {
      return;
    }

    this.handleConfigChange({
      hiddenColumnKeys: hiddenColumnKeys.includes(columnKey)
        ? removeFromArray(hiddenColumnKeys, key => key === columnKey)
        : [...hiddenColumnKeys, columnKey],
    });
  };

  getResizedColumns = memoize((columns, columnWidths) =>
    columns.map(col => {
      const columnKey = getColumnKey(col);
      const width = columnWidths && columnWidths[columnKey] ? columnWidths[columnKey] : col.width;

      return {
        ...col,
        width,
        onHeaderCell: column => ({
          ...(col.onHeaderCell && col.onHeaderCell(col)),
          width: column.width,
          onResize: (e, { size: { width } }) => {
            this.handleColumnWidthChange(columnKey, width);
          },
        }),
      };
    })
  );

  handleColumnWidthChange = (columnKey, width) => {
    const { columnWidths = {} } = this.state.config;

    this.handleConfigChange({
      columnWidths: {
        ...columnWidths,
        [columnKey]: width,
      },
    });
  };

  getColumnOrders = memoize((columns, columnOrders) =>
    columns.reduce(
      (acc, col) => (acc.includes(getColumnKey(col)) ? acc : [...acc, getColumnKey(col)]),
      columnOrders || []
    )
  );

  getOrderedColumns = memoize((columns, columnOrders) =>
    columnOrders.reduce((acc, columnKey) => {
      const column = columns.find(col => getColumnKey(col) === columnKey);
      return column ? [...acc, column] : acc;
    }, [])
  );

  handleColumnOrderChange = (fromIdx, toIdx) =>
    this.handleConfigChange({
      columnOrders: arrayMove(
        this.getColumnOrders(this.props.columns, this.state.config.columnOrders),
        fromIdx,
        toIdx
      ),
    });

  getSortKey = () => this.state.sortKey || this.props.defaultSortKey;

  getSortOrder = () => this.state.sortOrder || this.props.defaultSortOrder;

  getSortableColumns = memoize((columns, sortKey, sortOrder) =>
    columns.map(col =>
      col.sorter && col.dataIndex
        ? {
            ...col,
            onHeaderCell: () => ({
              ...(col.onHeaderCell && col.onHeaderCell(col)),
              onClick: e => isSortElement(e.target) && this.handleSortChange(col.dataIndex),
            }),
            sortOrder: sortKey === col.dataIndex && sortOrder,
          }
        : col
    )
  );

  handleSortChange = sortKey =>
    sortKey === this.getSortKey()
      ? this.setState({
          sortOrder: this.getSortOrder() === SORT_ORDERS.ASC ? SORT_ORDERS.DESC : SORT_ORDERS.ASC,
        })
      : this.setState({ sortKey });

  getTransformedColumns() {
    const { enableColumnManagement } = this.props;
    const {
      config: { hiddenColumnKeys, columnWidths, columnOrders },
    } = this.state;

    let columns = this.props.columns;

    if (this.isResizeEnabled()) {
      columns = this.getResizedColumns(columns, columnWidths);
    }

    if (this.isColumnOrderingEnabled()) {
      columns = this.getOrderedColumns(
        columns,
        this.getColumnOrders(this.props.columns, columnOrders)
      );
    }

    if (this.isSortEnabled()) {
      columns = this.getSortableColumns(columns, this.getSortKey(), this.getSortOrder());
    } else {
      columns = columns.map(column => ({ ...column, sorter: false }));
    }

    if (enableColumnManagement && hiddenColumnKeys && hiddenColumnKeys.length > 0) {
      columns = this.getVisibleColumns(columns, hiddenColumnKeys);
    }

    return columns;
  }

  getTableBodyEl = () =>
    document.querySelector(`#${this.props.id} .trader-table-scroll > .trader-table-body`);

  render() {
    const {
      className,
      dataSource,
      emptyText,
      enableColumnManagement,
      id,
      isMobile,
      loading,
      onRow,
      pageSize,
      rowClassName,
      rowHeight,
      rowKey,
      showHeader,
      t,
    } = this.props;
    const {
      config: { hiddenColumnKeys },
    } = this.state;

    const components = this.getComponents(this.props.components, this.isResizeEnabled());

    const columns = this.getTransformedColumns();

    return (
      <>
        {enableColumnManagement && (
          <ColumnsManagementModal
            columns={this.props.columns}
            hiddenColumnKeys={hiddenColumnKeys}
            onChange={this.handleColumnVisibilityChange}
          />
        )}
        <ElementResizeDetector
          defaultHeight={Infinity}
          defaultWidth={Infinity}
          elementSelector={this.getTableBodyEl}
        >
          {({ height: tableBodyHeight, width: tableBodyWidth }) => (
            <PaginationEnhancer
              pageSize={pageSize}
              rowHeight={rowHeight}
              dataSource={dataSource}
              rowCount={dataSource.length}
              tableBodyHeight={tableBodyHeight}
            >
              {({
                pageSize: computedPageSize,
                hasPagination,
                dataSource: paginationDataSource,
                className: paginationClassName,
              }) => (
                <ScrollableEnhancer
                  columns={columns}
                  getTableBodyEl={this.getTableBodyEl}
                  rowHeight={rowHeight}
                  rowCount={dataSource.length}
                  tableBodyHeight={tableBodyHeight}
                  tableBodyWidth={tableBodyWidth}
                >
                  {({ scroll }) => (
                    <DraggableColumns
                      enable={this.isColumnOrderingEnabled()}
                      onDragEnd={this.handleColumnOrderChange}
                    >
                      <Table
                        prefixCls="trader-table"
                        className={cn(className, paginationClassName)}
                        columns={columns}
                        components={components}
                        dataSource={paginationDataSource || dataSource}
                        id={id}
                        loading={loading}
                        locale={{
                          emptyText: emptyText || t('table.emptyText', { defaultValue: 'No data' }),
                        }}
                        pagination={
                          !hasPagination
                            ? false
                            : {
                                pageSize: computedPageSize,
                                prefixCls: 'trader-pagination',
                                simple: isMobile,
                              }
                        }
                        rowClassName={rowClassName}
                        rowKey={rowKey}
                        scroll={scroll}
                        showHeader={showHeader}
                        onRow={onRow}
                      />
                    </DraggableColumns>
                  )}
                </ScrollableEnhancer>
              )}
            </PaginationEnhancer>
          )}
        </ElementResizeDetector>
      </>
    );
  }
}

export default translate()(IsMobile(EnhancedTable));

/**
 * COLUMNS DOCS
 *
 * Columns API (https://ant.design/components/table/#Column) has been extended with these properties:
 * - alwaysVisible (Bool) - makes column always visible without possibility to hide it
 */
