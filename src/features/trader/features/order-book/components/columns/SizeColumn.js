import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';

import { Tooltip, Value } from '../../../../../../common/components/trader';
import { selectSizeDecimals } from '../../ducks';

const MIN_WIDTH_PERCENT_FILL = 1;
const CELL_WIDTH_FILL_MULTIPLIER = 0.95;

const mapStateToProps = state => ({
  decimals: selectSizeDecimals(state),
});

const SizeColumn = ({ decimals, decimalsOverride, fillClassName, fillWidth, mySize, size }) => (
  <span className="with-bg">
    {fillWidth ? <div className={fillClassName} style={{ width: `${fillWidth}%` }} /> : null}
    <span className="padded-cell-span">
      {!!mySize && (
        <>
          <Tooltip
            title={
              <Trans i18nKey="trader.orderBook.yourOrder">
                Size remaining of your active orders at this price level.
              </Trans>
            }
          >
            <span className="my-size">
              <Value.Numeric type="size" decimals={decimalsOverride || decimals} value={mySize} />
            </span>
          </Tooltip>{' '}
        </>
      )}
      <Value.Numeric decimals={decimalsOverride || decimals} type="size" value={size} />
    </span>
  </span>
);

SizeColumn.defaultProps = {
  size: 0,
};

SizeColumn.propTypes = {
  decimals: PropTypes.number.isRequired,
  decimalsOverride: PropTypes.number,
  fillClassName: PropTypes.string,
  fillWidth: PropTypes.number,
  mySize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

SizeColumn.calcFillWidth = columnKey => (value, order) =>
  value
    ? MIN_WIDTH_PERCENT_FILL + (order.percentOfMax[columnKey] || 0) * CELL_WIDTH_FILL_MULTIPLIER
    : 0;

export default connect(mapStateToProps)(SizeColumn);
