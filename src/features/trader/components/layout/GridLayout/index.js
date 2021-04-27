import React, { Component, createContext } from 'react';
import PropTypes from 'prop-types';
import ReactGridLayout, { WidthProvider, utils } from 'react-grid-layout';
import isEqual from 'lodash.isequal';

import { ConfigProvider } from '../../../../../common/components';

const RGL = WidthProvider(ReactGridLayout);

const containerPadding = [0, 0];
const margin = [-1, -1];

export const GridLayoutContext = createContext('grid-layout');

export default class GridLayout extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    cols: PropTypes.number.isRequired,
    isDraggable: PropTypes.bool,
    isResizable: PropTypes.bool,
    layout: PropTypes.array.isRequired,
    rowHeight: PropTypes.number.isRequired,
    onLayoutChange: PropTypes.func,
  };

  static defaultProps = {
    isDraggable: false,
    isResizable: false,
  };

  state = {
    draggedWidgetId: undefined,
  };

  containerRef = React.createRef();

  getPopupContainer = () => this.containerRef.current;

  handleDragStart = (_, widget) => {
    this.setState({ draggedWidgetId: widget.i });
  };

  handleDragStop = layout => {
    this.setState({ draggedWidgetId: undefined });
  };

  handleLayoutChange = newLayout => {
    const { layout, onLayoutChange } = this.props;

    // We have to clone layouts to be able to compare layouts https://github.com/STRML/react-grid-layout/issues/504
    if (onLayoutChange && !isEqual(utils.cloneLayout(newLayout), utils.cloneLayout(layout))) {
      onLayoutChange(newLayout);
    }
  };

  render() {
    const { children, cols, isDraggable, isResizable, layout, rowHeight } = this.props;
    const { draggedWidgetId } = this.state;

    return (
      <ConfigProvider getPopupContainer={this.getPopupContainer}>
        <div ref={this.containerRef} className="react-grid-layout-wrapper">
          <RGL
            cols={cols}
            containerPadding={containerPadding}
            draggableHandle=".grid-layout-tile-controls .icon-drag"
            isDraggable={isDraggable}
            isResizable={isResizable}
            layout={layout}
            margin={margin}
            measureBeforeMount
            rowHeight={rowHeight}
            useCSSTransforms={false}
            onDragStart={this.handleDragStart}
            onDragStop={this.handleDragStop}
            onLayoutChange={this.handleLayoutChange}
          >
            {layout
              .filter(widget => children[widget.i])
              .map(widget => {
                const LayoutItem = children[widget.i];

                return (
                  <div key={widget.i}>
                    <GridLayoutContext.Provider
                      value={{
                        id: widget.i,
                        isDragged: draggedWidgetId === widget.i,
                        isDraggable:
                          isDraggable && widget.static !== true && widget.isDraggable !== false,
                      }}
                    >
                      <LayoutItem />
                    </GridLayoutContext.Provider>
                  </div>
                );
              })}
          </RGL>
        </div>
      </ConfigProvider>
    );
  }
}
