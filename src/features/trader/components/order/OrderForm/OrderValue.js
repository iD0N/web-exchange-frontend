import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { t } from '../../../../../common/services/i18n';
import { Value } from '../../../../../common/components/trader';
import { SIZE_TYPE } from '../../../features/order-entry/constants';
import { getCost, getQuantity } from '../../../features/order-entry/utils';

const getValue = ({ size, price, notional, sizeType }) =>
  sizeType === SIZE_TYPE.QUANTITY ? getCost(price, size) : getQuantity(notional, price);

const isAvailable = value => !isNaN(value) && !!value && Math.abs(value) !== Infinity;

const OrderValue = props =>
  props.sizeType === SIZE_TYPE.QUANTITY ? (
    <div className="size-estimate-wrapper">
      <Value
        label={t('trader.orderEntry.notionalValue', {
          quoteCurrency: props.quoteCurrency,
          defaultValue: `Notional Value (${props.quoteCurrency})`,
        })}
      >
        {isAvailable(getValue(props)) ? (
          <Value.Numeric
            type="currency"
            noPrefix
            decimals={props.priceDecimals}
            value={Number.isNaN(getValue(props)) ? 0 : getValue(props)}
          />
        ) : (
          <Value.Text>
            <Trans i18nKey="trader.orderEntry.maxNA">N/A</Trans>
          </Value.Text>
        )}
      </Value>
    </div>
  ) : (
    <Value
      label={
        <Trans i18nKey="trader.orderEntry.quantityValue">Quantity ({props.contractCode})</Trans>
      }
    >
      {isAvailable(getValue(props)) ? (
        <Value.Numeric
          type="size"
          noPrefix
          decimals={props.sizeDecimals}
          value={Number.isNaN(getValue(props)) ? 0 : getValue(props)}
        />
      ) : (
        <Value.Text>
          <Trans i18nKey="trader.orderEntry.maxNA">N/A</Trans>
        </Value.Text>
      )}
    </Value>
  );

OrderValue.propTypes = {
  contractCode: PropTypes.string.isRequired,
  sizeType: PropTypes.string.isRequired,
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default OrderValue;
