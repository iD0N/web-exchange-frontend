import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { Checkbox } from '../../../../../../common/components/trader';

const FilterToggleContract = ({ checked, onClick }) => (
  <Checkbox checked={checked} onChange={onClick}>
    <Trans i18nKey="trader.orders.filter">Filter to currently selected contract</Trans>
  </Checkbox>
);

FilterToggleContract.propTypes = {
  checked: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

FilterToggleContract.defaultProps = {
  checked: false,
};

export default FilterToggleContract;
