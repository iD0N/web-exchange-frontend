import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import { Row, Col } from '../../../../../../common/components';
import { toPriceString } from '../../../../../../common/utils/numberHelpers';

import MarginBar from '../MarginBar';

import {
  DayPl,
  UnrealizedPl,
  RealizedPl,
  TotalPl,
  TokenBalance,
  NetLiquidity,
  LiquidationLevel,
  InitialMargin,
  AvailableMargin,
  OrderHolds,
  BuyingPower,
  EffectiveLeverage,
} from './values';

const AccountSummaryOverlay = ({
  accountSummaryData: {
    pl,
    marginBarValues,
    marginBarValues: { dataReady, showLiquidationBar, netLiquidationColor },
    balances: {
      activeOrderHolds,
      collateralBalances,
      liquidationLevel,
      netLiquidationValue,
      maintenanceMargin,
      initialMargin,
      buyingPower,
      effectiveLeverage,
    },
  },
  isMobile,
}) => (
  <div
    className={cn('account-summary-overlay', {
      'account-summary-overlay-liquidation': showLiquidationBar,
    })}
  >
    <Row>
      <Col span={12}>
        <DayPl value={pl.dayPl} />
      </Col>
      <Col span={12}>
        <UnrealizedPl value={pl.unrealizedPl} />
      </Col>
    </Row>
    <Row>
      <Col span={12}>
        <RealizedPl value={pl.realizedPl} />
      </Col>
      <Col span={12}>
        <TotalPl value={pl.totalPl} />
      </Col>
    </Row>
    <Divider />
    {collateralBalances.map((row, index) => (
      <Row key={index}>
        {row.map(({ balance, tokenCode, decimalPlaces }, colIndex) => (
          <Col span={index !== 0 || row.length === 3 ? 8 : 12} key={colIndex}>
            <TokenBalance tokenCode={tokenCode} value={balance} decimals={decimalPlaces} />
          </Col>
        ))}
      </Row>
    ))}
    <Divider />
    <Row>
      <Col span={12}>
        <NetLiquidity
          value={toPriceString(netLiquidationValue)}
          legendColor={netLiquidationColor}
          showLegendColor={showLiquidationBar}
        />
      </Col>
      <Col span={12}>
        <EffectiveLeverage value={effectiveLeverage} />
      </Col>
    </Row>
    <Divider />
    <Row>
      <Col span={12}>
        <InitialMargin value={initialMargin} showLegendColor={!showLiquidationBar} />
      </Col>
      <Col span={12}>
        <LiquidationLevel value={liquidationLevel} showLegendColor={showLiquidationBar} />
      </Col>
    </Row>
    {showLiquidationBar ? (
      <Row>
        <Col span={12}>
          <AvailableMargin value={toPriceString(buyingPower)} />
        </Col>
        <Col span={12} />
      </Row>
    ) : (
      <Row>
        <Col span={12}>
          <OrderHolds value={activeOrderHolds} />
        </Col>
        <Col span={12}>
          <BuyingPower value={toPriceString(buyingPower)} />
        </Col>
      </Row>
    )}
    {!!dataReady && (
      <div className="account-margin-bar-wrapper">
        <MarginBar {...marginBarValues} />
      </div>
    )}
    {isMobile && <Divider />}
  </div>
);

AccountSummaryOverlay.propTypes = {
  accountSummaryData: PropTypes.object.isRequired,
  isMobile: PropTypes.bool,
};

export default AccountSummaryOverlay;

const Divider = () => <div className="account-summary-overlay-divider" />;
