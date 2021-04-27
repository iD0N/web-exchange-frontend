import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

const SetMax = ({ max, onClick }) => (
  <div className="set-max" onClick={onClick}>
    <Trans i18nKey="settings.transfers.withdrawals.max">Max</Trans>
  </div>
);

SetMax.propTypes = {
  max: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default SetMax;
