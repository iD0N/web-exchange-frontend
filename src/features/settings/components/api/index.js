import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';

import { connectSpinner } from '../../../../common/services/spinner';

import {
  selectKeys,
  selectCreated,
  fetchApiKeysActions,
  createApiKeyActions,
  deleteApiKeyActions,
  clearCreatedAction,
} from './ducks';
import { apiCallIds } from './api';
import ApiKeys from './components/ApiKeys';

const EnhancedApiKeys = connectSpinner({
  isFetching: apiCallIds.GET_KEYS,
  isCreating: apiCallIds.CREATE_KEY,
  isDeleting: apiCallIds.DELETE_KEY,
})(ApiKeys);

const mapStateToProps = state => ({
  keys: selectKeys(state),
  created: selectCreated(state),
});

const mapDispatchToProps = {
  fetchApiKeys: fetchApiKeysActions.request,
  onCreateClick: createApiKeyActions.request,
  onDeleteClick: deleteApiKeyActions.request,
  clearCreated: clearCreatedAction,
};

const ApiContainer = props => (
  <div className="settings-api-keys-wrapper" id="settings-api-keys-wrapper">
    <h1>
      <Trans i18nKey="settings.api.header">API Keys</Trans>
    </h1>
    <EnhancedApiKeys {...props} />
    <h2>
      <Trans i18nKey="settings.api.documentation.header">API Docs</Trans>
    </h2>
    <a href="https://docs.crypto.io/#introduction" target="_blank" rel="noopener noreferrer">
      <Trans i18nKey="settings.api.documentation.link">API Documentation</Trans>
    </a>
  </div>
);

ApiContainer.propTypes = {
  keys: PropTypes.array.isRequired,
  created: PropTypes.object.isRequired,
  fetchApiKeys: PropTypes.func.isRequired,
  onCreateClick: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  clearCreated: PropTypes.func.isRequired,
  isMobile: PropTypes.bool,
};

export default connect(mapStateToProps, mapDispatchToProps)(ApiContainer);
