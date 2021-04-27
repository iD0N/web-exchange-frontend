import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import { Value, InfoTooltip } from '../../../../../../../../common/components/trader';

import { LEGEND_COLOR_CLASSES, ZERO_BALANCE_VALUE } from '../../../../constants';

const SummaryItem = ({
  className,
  decimals,
  label,
  legendColor,
  overrideValue,
  showLegendColor,
  token,
  tooltip,
  type,
  value,
  withDirection,
}) => (
  <div className="summary-item">
    <Value
      className={cn(className, {
        [LEGEND_COLOR_CLASSES[legendColor]]: showLegendColor,
      })}
      label={
        tooltip ? (
          <InfoTooltip placement="topLeft" title={tooltip}>
            {label}
          </InfoTooltip>
        ) : (
          label
        )
      }
    >
      {overrideValue ? (
        value
      ) : (
        <Value.Numeric
          decimals={decimals}
          withDirection={withDirection}
          type={type}
          value={value}
          token={token}
        />
      )}
    </Value>
  </div>
);

SummaryItem.propTypes = {
  className: PropTypes.string,
  label: PropTypes.node.isRequired,
  token: PropTypes.string,
  tooltip: PropTypes.node,
  type: PropTypes.string.isRequired,
  showLegendColor: PropTypes.bool.isRequired,
  value: PropTypes.oneOfType([PropTypes.node, PropTypes.number, PropTypes.string]).isRequired,
  withDirection: PropTypes.bool.isRequired,
};

SummaryItem.defaultProps = {
  decimals: 2,
  type: 'currency',
  showLegendColor: false,
  withDirection: false,
  value: ZERO_BALANCE_VALUE,
};

export default SummaryItem;
