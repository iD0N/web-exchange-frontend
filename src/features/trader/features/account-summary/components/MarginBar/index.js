import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import cn from 'classnames';

import { Progress } from '../../../../../../common/components/trader';

const alignLabelLeft = percent => percent >= 50;

const BAR_STROKE = 5;
const CONDENSED_STROKE = 3;

function getLiquidityBarClass(color) {
  return `liquidation-bar-${color}`;
}

const MarginBar = ({
  condensed,
  dataReady,
  showLiquidationBar,
  initialMargin,
  orderHolds,
  liquidationLevel,
  netLiquidationValue,
  netLiquidationColor,
  zeroBalance,
}) =>
  dataReady &&
  (showLiquidationBar ? (
    <div className={cn('liquidation-bar', getLiquidityBarClass(netLiquidationColor))}>
      <Progress
        showInfo={false}
        percent={netLiquidationValue}
        strokeWidth={condensed ? CONDENSED_STROKE : BAR_STROKE}
      />
      <div
        className="liquidation-bar-tick liquidation-bar-tick-liquidation-level"
        style={{ left: `${liquidationLevel}%` }}
      >
        <div className={cn('label', { 'label-left': alignLabelLeft(liquidationLevel) })}>
          <Trans i18nKey="trader.accountBalance.liquidationLevel">Liquidation Level</Trans>
        </div>
      </div>
    </div>
  ) : (
    <span
      className={cn('net-liquidation-margin-bars', {
        'net-liquidation-margin-bars-zero-balance': zeroBalance,
      })}
    >
      <Progress
        showInfo={false}
        successPercent={initialMargin}
        percent={orderHolds}
        strokeWidth={condensed ? CONDENSED_STROKE : BAR_STROKE}
      />
    </span>
  ));

MarginBar.propTypes = {
  condensed: PropTypes.bool,
  dataReady: PropTypes.bool.isRequired,
  showLiquidationBar: PropTypes.bool.isRequired,
  initialMargin: PropTypes.number.isRequired,
  orderHolds: PropTypes.number.isRequired,
  liquidationLevel: PropTypes.number.isRequired,
  netLiquidationValue: PropTypes.number.isRequired,
  netLiquidationColor: PropTypes.string.isRequired,
};

export default memo(MarginBar);
