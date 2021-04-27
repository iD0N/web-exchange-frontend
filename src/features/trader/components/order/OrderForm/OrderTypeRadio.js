import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { ORDER_TYPE } from '../../../../../common/enums';
import { ElementResizeDetector } from '../../../../../common/components';
import { FormItem, Tooltip, Radio } from '../../../../../common/components/trader';
import { isOfLimitOrderType } from '../../../features/orders/utils';

const getWidgetElem = () => document.getElementById('orderEntry');

const isCondensed = width => width < 300;

const OrderTypeRadio = ({ value }) => (
  <ElementResizeDetector elementSelector={getWidgetElem}>
    {({ width }) => (
      <FormItem className="order-type-radio-wrapper" id="orderType" initialValue={value}>
        <Radio.Group>
          <Radio.Button value={ORDER_TYPE.LIMIT} className="order-entry-order-type-limit">
            {isCondensed(width) ? (
              <Tooltip title={'Limit order'}>LMT</Tooltip>
            ) : (
              <Trans i18nKey="trader.orderEntry.limit">Limit</Trans>
            )}
          </Radio.Button>
          <Radio.Button value={ORDER_TYPE.MARKET} className="order-entry-order-type-market">
            {isCondensed(width) ? (
              <Tooltip title={'Market order'}>MKT</Tooltip>
            ) : (
              <Trans i18nKey="trader.orderEntry.market">Market</Trans>
            )}
          </Radio.Button>
          <Radio.Button
            value={isOfLimitOrderType(value) ? ORDER_TYPE.STOP_LIMIT : ORDER_TYPE.STOP_MARKET}
            className="order-entry-order-type-stop"
          >
            <Tooltip
              title={
                <Trans i18nKey="trader.orderEntry.stopDescription">
                  Stop orders let you specify a price below which (for sells) or above which (for
                  buys) the order will trigger. This order type can help traders limit losses.
                </Trans>
              }
            >
              {isCondensed(width) ? 'STP' : <Trans i18nKey="trader.orderEntry.stop">Stop</Trans>}
            </Tooltip>
          </Radio.Button>
          <Radio.Button
            value={isOfLimitOrderType(value) ? ORDER_TYPE.TAKE_LIMIT : ORDER_TYPE.TAKE_MARKET}
            className="order-entry-order-type-take"
          >
            <Tooltip
              title={
                <Trans i18nKey="trader.orderEntry.takeProfitDescription">
                  Take Profit orders let you specify a price at or above which (for sells) or at or
                  below which (for buys) the order will trigger. This order type can help traders
                  set profit targets or open positions.
                </Trans>
              }
            >
              {isCondensed(width) ? (
                'TKP'
              ) : (
                <Trans i18nKey="trader.orderEntry.takeProfit">Take Profit</Trans>
              )}
            </Tooltip>
          </Radio.Button>
        </Radio.Group>
      </FormItem>
    )}
  </ElementResizeDetector>
);

OrderTypeRadio.propTypes = {
  value: PropTypes.string.isRequired,
};

export default OrderTypeRadio;
