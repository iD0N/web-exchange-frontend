import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import { Table, Menu, WidgetSettingsDropdown } from '../../../../../../common/components/trader';
import { ResetWidgetConfigMenuItem } from '../../../../components';

import FilterContractToggle from '../SettingsMenu/FilterContractToggle';
import CancelAllOrders from '../SettingsMenu/CancelAllOrders';

const OrdersControls = ({
  cancelAllOrders,
  cancelAllOrdersFiltered,
  contractCode,
  filtered,
  t,
  toggleFiltered,
  onWidgetConfigReset,
}) => (
  <Table.ColumnsManagementModalContextConsumer>
    {({ handleShow }) => (
      <WidgetSettingsDropdown
        overlay={
          <Menu className="orders-widget-dropdown-menu">
            <Table.ColumnsManagementMenuItem onClick={handleShow} />
            <ResetWidgetConfigMenuItem onClick={onWidgetConfigReset} />
            <Menu.Item key="filter-orders" disabled>
              <FilterContractToggle checked={filtered} onClick={toggleFiltered} />
            </Menu.Item>
            <Menu.Item key="cancel-all-orders" onClick={cancelAllOrders}>
              <CancelAllOrders
                contractCode={t('trader.orders.allContracts', {
                  defaultValue: 'All Contracts',
                })}
              />
            </Menu.Item>
            {filtered && (
              <Menu.Item key="cancel-all-filtered-orders" onClick={cancelAllOrdersFiltered}>
                <CancelAllOrders contractCode={contractCode} />
              </Menu.Item>
            )}
          </Menu>
        }
      />
    )}
  </Table.ColumnsManagementModalContextConsumer>
);

OrdersControls.propTypes = {
  cancelAllOrders: PropTypes.func.isRequired,
  cancelAllOrdersFiltered: PropTypes.func.isRequired,
  contractCode: PropTypes.string.isRequired,
  filtered: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  toggleFiltered: PropTypes.func.isRequired,
  onWidgetConfigReset: PropTypes.func.isRequired,
};

export default memo(translate()(OrdersControls));
