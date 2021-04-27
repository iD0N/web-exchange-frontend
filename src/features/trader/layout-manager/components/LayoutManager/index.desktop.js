import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { GridLayout } from '../../../components';

import { fetchLayoutAction, changeLayoutAction, selectLayout } from '../../ducks';
import { GRID_LAYOUT_COLS, GRID_LAYOUT_ROW_HEIGHT } from '../../constants';

const mapStateToProps = state => ({
  layout: selectLayout(state),
});

const mapDispatchToProps = {
  fetchLayout: fetchLayoutAction,
  changeLayout: changeLayoutAction,
};

class LayoutManager extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    layout: PropTypes.array.isRequired,
    fetchLayout: PropTypes.func.isRequired,
    changeLayout: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.props.fetchLayout();
  }

  render() {
    const { changeLayout, children, layout } = this.props;

    return (
      <GridLayout
        cols={GRID_LAYOUT_COLS}
        isDraggable
        isResizable
        layout={layout}
        rowHeight={GRID_LAYOUT_ROW_HEIGHT}
        onLayoutChange={changeLayout}
      >
        {children}
      </GridLayout>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LayoutManager);
