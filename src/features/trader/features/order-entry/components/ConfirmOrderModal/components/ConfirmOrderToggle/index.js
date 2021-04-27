import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';

import { connectKeyValueStore } from '../../../../../../../../common/services/keyValueStore';
import { Checkbox } from '../../../../../../../../common/components/trader';
import {
  widgetConfigInitialValue,
  ORDER_ENTRY_WIDGET_CONFIG_VALUE_KEY,
} from '../../../../constants';

export const TOGGLE_TYPE = {
  HIDE: 'hide',
  SHOW: 'show',
};

const TOGGLE_LABEL = {
  [TOGGLE_TYPE.HIDE]: (
    <Trans i18nKey="trader.orderEntry.confirmation.dontShowAgain">Don't show again</Trans>
  ),
  [TOGGLE_TYPE.SHOW]: (
    <Trans i18nKey="trader.orderEntry.confirmation.showConfirmation">Show Order Confirmation</Trans>
  ),
};

const mapStateToProps = (state, props) => ({
  widgetConfig: props[ORDER_ENTRY_WIDGET_CONFIG_VALUE_KEY],
});

const ConfirmOrderToggle = ({
  onConfirmationToggle,
  type,
  widgetConfig: { isOrderConfimationRequired: checked },
}) => (
  <Checkbox
    checked={type === TOGGLE_TYPE.SHOW ? checked : !checked}
    className="order-entry-confirm-order-toggle"
    onChange={({ target: { checked } }) =>
      onConfirmationToggle(type === TOGGLE_TYPE.SHOW ? checked : !checked)
    }
  >
    {TOGGLE_LABEL[type]}
  </Checkbox>
);

ConfirmOrderToggle.propTypes = {
  widgetConfig: PropTypes.shape({ isOrderConfimationRequired: PropTypes.bool.isRequired }),
  onConfirmationToggle: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
};

ConfirmOrderToggle.defaultProps = {
  widgetConfig: widgetConfigInitialValue,
};

export default connectKeyValueStore(ORDER_ENTRY_WIDGET_CONFIG_VALUE_KEY)(
  connect(mapStateToProps)(ConfirmOrderToggle)
);
