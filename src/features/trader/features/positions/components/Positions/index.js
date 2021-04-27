import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';

import { Spin } from '../../../../../../common/components';
import {
  Checkbox,
  Tabs,
  Table,
  Menu,
  WidgetSettingsDropdown,
} from '../../../../../../common/components/trader';
import { GridLayoutTile, ResetWidgetConfigMenuItem } from '../../../../components';
import { ConnectOrderEntryContext } from '../../../order-entry/OrderEntryContext';

import { TABS } from '../../constants';
import BalancesTable from '../BalancesTable';
import PositionsTable from '../PositionsTable';

const { WithTabs } = Tabs;

const TABS_T = () => ({
  [TABS.POSITIONS]: <Trans i18nKey="trader.positions.title">Positions</Trans>,
  [TABS.BALANCES]: <Trans i18nKey="trader.positions.balances.title">Balances</Trans>,
});

class Positions extends Component {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    widgetConfig: PropTypes.object.isRequired,
    onTableConfigChange: PropTypes.func.isRequired,
    onWidgetConfigReset: PropTypes.func.isRequired,
  };

  componentDidUpdate({ globalContractIsSpot: wasSpot }) {
    if (wasSpot !== this.props.globalContractIsSpot && this.keySetter) {
      this.keySetter(this.props.globalContractIsSpot ? TABS.BALANCES : TABS.POSITIONS);
    }
  }

  render() {
    const {
      highlightedTokenCodes,
      isRebalancingUsd,
      isLoading,
      widgetConfig,
      onTableConfigChange,
      onWidgetConfigReset,
      orderEntryContext: {
        handleClosePositionConfirmationToggle,
        widgetConfig: orderEntryWidgetConfig,
      },
    } = this.props;

    return (
      <Spin spinning={isLoading}>
        <WithTabs
          defaultKey={this.props.globalContractIsSpot ? TABS.BALANCES : TABS.POSITIONS}
          tabs={TABS}
          tabsT={TABS_T()}
        >
          {({ activeKey, keySetter }) => {
            this.keySetter = keySetter;
            return (
              <Table.ColumnsManagementModalContextProvider>
                <GridLayoutTile
                  title={<Tabs />}
                  controls={
                    activeKey === TABS.POSITIONS && (
                      <Table.ColumnsManagementModalContextConsumer>
                        {({ handleShow }) => (
                          <WidgetSettingsDropdown
                            overlay={
                              <Menu>
                                <Table.ColumnsManagementMenuItem onClick={handleShow} />
                                <ResetWidgetConfigMenuItem onClick={onWidgetConfigReset} />
                                <Menu.Item key="display-close-position-confirmation" disabled>
                                  <Checkbox
                                    checked={
                                      !orderEntryWidgetConfig.disableClosePositionConfirmation
                                    }
                                    onChange={() => {
                                      handleClosePositionConfirmationToggle(
                                        !orderEntryWidgetConfig.disableClosePositionConfirmation
                                      );
                                    }}
                                  >
                                    <Trans i18nKey="trader.positions.widgetConfig.showConfirmation">
                                      Show confirmation for Close Position
                                    </Trans>
                                  </Checkbox>
                                </Menu.Item>
                              </Menu>
                            }
                          />
                        )}
                      </Table.ColumnsManagementModalContextConsumer>
                    )
                  }
                  content={
                    widgetConfig.tableConfig &&
                    (activeKey === TABS.POSITIONS ? (
                      <PositionsTable
                        config={widgetConfig.tableConfig}
                        onConfigChange={onTableConfigChange}
                        hideConfirmations={orderEntryWidgetConfig.disableClosePositionConfirmation}
                      />
                    ) : (
                      <BalancesTable highlightedTokenCodes={highlightedTokenCodes} isRebalancingUsd={isRebalancingUsd} />
                    ))
                  }
                  requiresAuth
                />
              </Table.ColumnsManagementModalContextProvider>
            );
          }}
        </WithTabs>
      </Spin>
    );
  }
}

export default ConnectOrderEntryContext(
  connect((_, { isLoading, isLoadingConfig }) => ({
    isLoading: isLoading || isLoadingConfig,
  }))(Positions)
);
