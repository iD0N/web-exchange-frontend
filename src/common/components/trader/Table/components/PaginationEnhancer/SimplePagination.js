import PropTypes from 'prop-types';
import cn from 'classnames';

const SimplePagination = ({ children, pageSize, rowCount }) =>
  children({
    pageSize,
    hasPagination: pageSize < rowCount,
    className: cn({
      'trader-table-with-pagination': pageSize < rowCount,
    }),
  });

SimplePagination.propTypes = {
  children: PropTypes.func.isRequired,
  pageSize: PropTypes.number.isRequired,
  rowCount: PropTypes.number.isRequired,
};

export default SimplePagination;
