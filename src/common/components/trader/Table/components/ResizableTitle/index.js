import React from 'react';
import PropTypes from 'prop-types';
import { Resizable } from 'react-resizable';

const ResizableTitle = ({ width, onResize, ...bag }) => {
  if (!width) {
    return <th {...bag} />;
  }

  return (
    <Resizable
      height={0}
      width={width}
      onResizeStart={e => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onResize={onResize}
    >
      <th {...bag} />
    </Resizable>
  );
};

ResizableTitle.propTypes = {
  width: PropTypes.number,
  onResize: PropTypes.func.isRequired,
};

export default ResizableTitle;
