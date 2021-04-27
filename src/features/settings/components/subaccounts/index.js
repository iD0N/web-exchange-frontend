import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';

import {
  createAccountAction,
  deleteAccountAction,
  internalTransferAction,
  selectAccounts,
} from '../../../../common/services/accounts';
import { selectTraderId } from '../../../../common/services/user';
import { apiCallIds } from '../../../../common/services/accounts/api';
import { connectSpinner } from '../../../../common/services/spinner';

import { selectInternallyTransferableTokens } from '../../../trader/data-store/ducks';
import { selectMaxTransfer, selectToken, setTokenAction } from '../transfers/ducks';

import Subaccounts from './component';

const EnhancedSubaccounts = connectSpinner({
  isFetching: apiCallIds.FETCH_ACCOUNTS,
  isCreating: apiCallIds.CREATE_ACCOUNT,
  isDeleting: apiCallIds.DELETE_ACCOUNT,
  isTransferring: apiCallIds.INTERNAL_TRANSFER,
})(Subaccounts);

const mapStateToProps = state => ({
  accounts: selectAccounts(state),
  tokens: selectInternallyTransferableTokens(state),
  token: selectToken(state),
  maxTransfer: selectMaxTransfer(state),
  currentTraderId: selectTraderId(state),
});

const mapDispatchToProps = {
  onCreateClick: createAccountAction.request,
  onDeleteClick: deleteAccountAction.request,
  onTransferClick: internalTransferAction.request,
  setToken: setTokenAction,
};

const SubAccountsContainer = props => (
  <div className="settings-subaccounts-wrapper">
    <h1>
      <Trans i18nKey="settings.subaccounts.title">Subaccounts</Trans>
    </h1>
    <EnhancedSubaccounts {...props} />
  </div>
);

SubAccountsContainer.propTypes = {
  accounts: PropTypes.array.isRequired,
  onCreateClick: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  isMobile: PropTypes.bool,
};

export default connect(mapStateToProps, mapDispatchToProps)(SubAccountsContainer);
