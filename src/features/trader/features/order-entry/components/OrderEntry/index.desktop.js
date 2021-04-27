import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { Spin } from '../../../../../../common/components';
import { Menu, WidgetSettingsDropdown } from '../../../../../../common/components/trader';
import { OrderForm, GridLayoutTile, WidgetHeader } from '../../../../components';

import PostOnlyWarning from '../PostOnlyWarning';

import ConfirmOrderToggle, {
  TOGGLE_TYPE,
} from '../ConfirmOrderModal/components/ConfirmOrderToggle';

const OrderEntry = ({
  contract,
  handleConfirmationToggle,
  isLoadingConfig,
  notional,
  onChange,
  onCloseClick,
  onSizeChange,
  onNotionalSizeChange,
  onSubmit,
  orderType,
  postOnly,
  price,
  reduceOnly,
  size,
  sizeType,
  stopOrderType,
  stopPrice,
  stopTrigger,
  trailValue,
}) => (
  <div className="order-entry" id="order-entry">
    <Spin spinning={!!isLoadingConfig}>
      <GridLayoutTile
        requiresAuth
        checkContractOutage={contract}
        title={
          <>
            <PostOnlyWarning contractCode={contract.contractCode} />
            <WidgetHeader title={<Trans i18nKey="trader.orderEntry.title">Order Entry</Trans>} />
          </>
        }
        controls={
          <div className="controls">
            <WidgetSettingsDropdown
              overlay={
                <Menu>
                  <Menu.Item disabled>
                    <ConfirmOrderToggle
                      onConfirmationToggle={handleConfirmationToggle}
                      type={TOGGLE_TYPE.SHOW}
                    />
                  </Menu.Item>
                </Menu>
              }
            />
          </div>
        }
        content={
          <OrderForm
            contract={contract}
            notional={notional}
            onSubmit={onSubmit}
            onChange={onChange}
            onSizeChange={onSizeChange}
            onNotionalSizeChange={onNotionalSizeChange}
            orderType={orderType}
            postOnly={postOnly}
            price={price}
            reduceOnly={reduceOnly}
            size={size}
            sizeType={sizeType}
            stopOrderType={stopOrderType}
            stopPrice={stopPrice}
            stopTrigger={stopTrigger}
            trailValue={trailValue}
          />
        }
      />
    </Spin>
  </div>
);

OrderEntry.propTypes = {
  contract: PropTypes.object.isRequired,
  handleConfirmationToggle: PropTypes.func,
  notional: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onCloseClick: PropTypes.func.isRequired,
  onNotionalSizeChange: PropTypes.func.isRequired,
  onSizeChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  orderType: PropTypes.object.isRequired,
  postOnly: PropTypes.object.isRequired,
  price: PropTypes.object.isRequired,
  reduceOnly: PropTypes.object.isRequired,
  size: PropTypes.object.isRequired,
  sizeType: PropTypes.object.isRequired,
  stopOrderType: PropTypes.object.isRequired,
  stopPrice: PropTypes.object.isRequired,
  stopTrigger: PropTypes.object.isRequired,
};

export default memo(OrderEntry);
