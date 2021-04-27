import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { FontIcon } from '../../../../../../common/components';

const CancelAllOrders = ({ contractCode }) => (
  <>
    <FontIcon type="delete" />
    <Trans i18nKey="trader.orders.cancelAllOrders" values={{ contract: contractCode }}>
      Cancel All Orders ({contractCode})
    </Trans>
  </>
);

CancelAllOrders.propTypes = {
  contractCode: PropTypes.string.isRequired,
};

export default CancelAllOrders;
