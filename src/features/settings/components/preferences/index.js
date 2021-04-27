import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';
import cn from 'classnames';

import { connectKeyValueStore } from '../../../../common/services/keyValueStore';
import { CheckboxSwitch } from '../../../../common/components/trader';
import { Col, Row } from '../../../../common/components';
import { apiCallIds } from '../../../trader/features/order-entry/ducks';
import {
  CONFIG_KEYS,
  ORDER_ENTRY_WIDGET_CONFIG_VALUE_KEY,
  widgetConfigInitialValue,
  SIZE_TYPE,
} from '../../../trader/features/order-entry/constants';

const mapStateToProps = (state, props) => ({
  widgetConfig: props[ORDER_ENTRY_WIDGET_CONFIG_VALUE_KEY],
});

class PreferencesContainer extends Component {
  static propTypes = {
    isMobile: PropTypes.bool,
  };

  static defaultProps = {
    widgetConfig: widgetConfigInitialValue,
  };

  componentDidMount() {
    this.props.getValue(
      {
        apiCallId: apiCallIds.FETCH_ORDER_ENTRY_WIDGET_CONFIG,
      },
      widgetConfigInitialValue
    );
  }

  handleConfigKeyValueToggle = configKey =>
    this.handleWidgetConfigChange({
      [configKey]: !this.props.widgetConfig[configKey],
    });

  handleWidgetConfigChange = config =>
    this.props.setValue({
      ...this.props.widgetConfig,
      ...config,
    });

  render() {
    const {
      isMobile,
      widgetConfig: {
        disableClosePositionConfirmation,
        disableOrderStatusUpdateNotifications,
        isOrderConfimationRequired,
        defaultSizeType,
      },
      inModal,
    } = this.props;

    const leftColWidth = inModal ? 20 : 14;
    const rightColWidth = inModal ? 4 : 10;

    return (
      <Row className={cn("settings-preferences-wrapper", {"settings-preferences-wrapper-in-modal": inModal})}>
        <Col span={isMobile ? 24 : 14}>
          {!inModal && <h1>
            <Trans i18nKey="settings.preferences.header">My Preferences</Trans>
          </h1>}
          <Row>
            <Col span={leftColWidth}>
              <h3>
                <Trans i18nKey="settings.preferences.confirmations">
                  Display confirmation dialog before placing trades
                </Trans>
              </h3>
            </Col>
            <Col span={rightColWidth}>
              <CheckboxSwitch
                size="small"
                checked={isOrderConfimationRequired}
                labelPlacement="left"
                onChange={() =>
                  this.handleConfigKeyValueToggle(CONFIG_KEYS.IS_ORDER_CONFIRMATION_REQUIRED)
                }
              />
            </Col>
          </Row>
          <Row>
            <Col span={leftColWidth}>
              <h3>
                <Trans i18nKey="settings.preferences.orderStatusNotifications">
                  Display notifications for order status updates
                </Trans>
              </h3>
            </Col>
            <Col span={rightColWidth}>
              <CheckboxSwitch
                size="small"
                checked={!disableOrderStatusUpdateNotifications}
                labelPlacement="left"
                onChange={() =>
                  this.handleConfigKeyValueToggle(
                    CONFIG_KEYS.DISABLE_ORDER_STATUS_UPDATE_NOTIFICATIONS
                  )
                }
              />
            </Col>
          </Row>
          <Row>
            <Col span={leftColWidth}>
              <h3>
                <Trans i18nKey="settings.preferences.closePositionConfirmation">
                  Display confirmation after clicking Close Position button
                </Trans>
              </h3>
            </Col>
            <Col span={rightColWidth}>
              <CheckboxSwitch
                size="small"
                checked={!disableClosePositionConfirmation}
                labelPlacement="left"
                onChange={() =>
                  this.handleConfigKeyValueToggle(CONFIG_KEYS.DISABLE_CLOSE_POSITION_CONFIRMATION)
                }
              />
            </Col>
          </Row>
          <Row>
            <Col span={leftColWidth}>
              <h3>
                <Trans i18nKey="settings.preferences.orderSizingNotional">
                  Order Sizing in USD
                </Trans>
              </h3>
            </Col>
            <Col span={rightColWidth}>
              <CheckboxSwitch
                size="small"
                checked={defaultSizeType === SIZE_TYPE.NOTIONAL}
                labelPlacement="left"
                onChange={isNotional => this.handleWidgetConfigChange({
                  [CONFIG_KEYS.DEFAULT_SIZE_TYPE]: isNotional ? SIZE_TYPE.NOTIONAL : SIZE_TYPE.QUANTITY,
                })}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

export default connectKeyValueStore(ORDER_ENTRY_WIDGET_CONFIG_VALUE_KEY)(
  connect(mapStateToProps)(PreferencesContainer)
);
