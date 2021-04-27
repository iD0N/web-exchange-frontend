import { Component } from 'react';
import PropTypes from 'prop-types';
import ps from 'perfect-scrollbar';

export default class ScrollableEnhancer extends Component {
  static propTypes = {
    columns: PropTypes.array.isRequired,
    children: PropTypes.func.isRequired,
    getTableBodyEl: PropTypes.func.isRequired,
    tableBodyHeight: PropTypes.number.isRequired,
    tableBodyWidth: PropTypes.number.isRequired,
    rowCount: PropTypes.number.isRequired,
    rowHeight: PropTypes.number.isRequired,
  };

  componentDidMount() {
    this.initScrollbar();
  }

  componentDidUpdate(prevProps) {
    const { tableBodyHeight, tableBodyWidth, rowCount, rowHeight } = this.props;

    if (
      tableBodyHeight !== prevProps.tableBodyHeight ||
      tableBodyWidth !== prevProps.tableBodyWidth ||
      rowCount !== prevProps.rowCount ||
      rowHeight !== prevProps.rowHeight
    ) {
      this.updateScrollbar();
    }
  }

  componentWillUnmount() {
    this.destructScrollbar();
  }

  initScrollbar = () => {
    const tableBodyEl = this.props.getTableBodyEl();

    if (tableBodyEl) {
      this.ps = new ps(tableBodyEl);
    }
  };

  updateScrollbar = () => {
    this.ps && this.ps.update();
  };

  destructScrollbar = () => {
    if (this.ps) {
      this.ps.destroy();
      this.ps = null;
    }
  };

  getWidth() {
    const totalWidth = this.props.columns.reduce((total, { width }) => total + width, 0);
    return typeof totalWidth === 'number' ? totalWidth : true;
  }

  getHeight() {
    return this.props.rowCount * this.props.rowHeight;
  }

  render() {
    return this.props.children({
      scroll: {
        x: this.getWidth(),
        y: this.getHeight(),
      },
    });
  }
}
