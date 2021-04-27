import React from 'react';
import { render } from 'react-testing-library';

import SimplePagination from './SimplePagination';

describe('SimplePagination.js', () => {
  const props = {
    children: jest.fn(() => null),
    pageSize: 10,
    rowCount: 11,
  };

  const { rerender } = render(<SimplePagination {...props} />);

  describe('initial render', () => {
    it('should show pagination', () => {
      expect(props.children).lastCalledWith({
        className: 'trader-table-with-pagination',
        pageSize: props.pageSize,
        hasPagination: true,
      });
    });
  });

  describe('when row is removed', () => {
    it('should not show pagination', () => {
      rerender(<SimplePagination {...props} rowCount={props.rowCount - 1} />);

      expect(props.children).lastCalledWith({
        className: '',
        pageSize: props.pageSize,
        hasPagination: false,
      });
    });
  });
});
