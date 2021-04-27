import React from 'react';
import PropTypes from 'prop-types';
import ReactDragListView from 'react-drag-listview';

const DraggableColumns = ({ enable, children, onDragEnd }) =>
  enable ? (
    <ReactDragListView.DragColumn
      lineClassName="table-dragline"
      nodeSelector="th"
      onDragEnd={onDragEnd}
    >
      {children}
    </ReactDragListView.DragColumn>
  ) : (
    children
  );

DraggableColumns.propTypes = {
  enable: PropTypes.bool,
  children: PropTypes.node.isRequired,
  onDragEnd: PropTypes.func.isRequired,
};

export default DraggableColumns;
