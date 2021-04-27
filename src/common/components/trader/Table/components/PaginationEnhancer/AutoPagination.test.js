import React from 'react';
import { render } from 'react-testing-library';

import { getLatestArgs } from '../../../../../../test/utils';

import AutoPagination from './AutoPagination';

describe('AutoPagination.js', () => {
  const props = {
    children: jest.fn(() => null),
    dataSource: [...Array(10)],
    rowHeight: 30,
    tableBodyHeight: Infinity,
  };

  const measuredProps = {
    ...props,
    tableBodyHeight: 300,
  };

  describe('initial render', () => {
    it('renders empty table to be measured', () => {
      render(<AutoPagination {...props} />);

      expect(props.children).toBeCalledWith({
        hasPagination: false,
        pageSize: Infinity,
        dataSource: [],
        className: 'trader-table-auto-pagination',
      });
    });

    it('computes pagination values after table height was measured', () => {
      const { rerender } = render(<AutoPagination {...props} />);

      rerender(<AutoPagination {...measuredProps} />);

      const [{ pageSize, hasPagination }] = getLatestArgs(props.children);

      expect(pageSize).toBe(10);
      expect(hasPagination).toBeFalsy();
    });
  });

  describe('when table height is measured', () => {
    const [, ...fitsSinglePage] = props.dataSource;
    const doesntFitSinglePage = [...props.dataSource, undefined];

    let rerender;

    beforeEach(() => {
      const app = render(<AutoPagination {...props} />);
      rerender = app.rerender;
      rerender(<AutoPagination {...measuredProps} />);
    });

    describe('when row is removed', () => {
      it('should disable pagination', () => {
        rerender(<AutoPagination {...measuredProps} dataSource={doesntFitSinglePage} />);
        rerender(<AutoPagination {...measuredProps} dataSource={fitsSinglePage} />);

        const [{ pageSize, hasPagination }] = getLatestArgs(props.children);

        expect(pageSize).toBeLessThan(10);
        expect(hasPagination).toBeFalsy();
      });
    });

    describe('when row is added', () => {
      it('should enable pagination', () => {
        rerender(<AutoPagination {...measuredProps} dataSource={fitsSinglePage} />);
        rerender(<AutoPagination {...measuredProps} dataSource={doesntFitSinglePage} />);

        const [{ pageSize, hasPagination }] = getLatestArgs(props.children);

        expect(pageSize).toBeLessThan(10);
        expect(hasPagination).toBeTruthy();
      });
    });

    describe('when table is expanded', () => {
      it('should disable pagination', () => {
        rerender(<AutoPagination {...measuredProps} dataSource={doesntFitSinglePage} />);
        rerender(
          <AutoPagination
            {...measuredProps}
            dataSource={doesntFitSinglePage}
            tableBodyHeight={400}
          />
        );

        const [{ pageSize, hasPagination }] = getLatestArgs(props.children);

        expect(pageSize).toBe(doesntFitSinglePage.length);
        expect(hasPagination).toBeFalsy();
      });
    });

    describe('when table is shrinked', () => {
      it('should enable pagination', () => {
        rerender(<AutoPagination {...measuredProps} dataSource={fitsSinglePage} />);
        rerender(
          <AutoPagination {...measuredProps} dataSource={fitsSinglePage} tableBodyHeight={200} />
        );

        const [{ pageSize, hasPagination }] = getLatestArgs(props.children);

        expect(pageSize).toBeLessThan(10);
        expect(hasPagination).toBeTruthy();
      });
    });
  });
});
