import React from 'react';
import { connectModal } from 'redux-modal';
import cn from 'classnames';
import { Trans } from 'react-i18next';

import { connectSpinner } from '../../../../common/services/spinner';
import { ConfirmationModal } from '../../../../common/components/trader';
import { apiCallIds } from '../../../settings/api';
import Preferences from '../../../settings/components/preferences';

export const TRADER_SETTINGS_MODAL = 'TRADER_SETTINGS_MODAL';

const EnhancedPreferences = connectSpinner({
  isLoading: apiCallIds.PREFERENCES_DATA,
})(Preferences);

const ConfirmModal = ConfirmationModal(TRADER_SETTINGS_MODAL);

const TraderSettingsModal = () => (
  <ConfirmModal
    wrapClassName="trader-modal-prompt trader-modal-prompt-settings"
    title={<Trans i18nKey="trader.contractBar.settings">Settings</Trans>}
    message={
      <div className={cn('trader-screen', 'settings-screen')}>
        <div className="settings-subpage-wrapper">
          <EnhancedPreferences inModal isMobile />
        </div>
      </div>
    }
    customCTA={<></>}
  />
);

export default connectModal({ name: TRADER_SETTINGS_MODAL })(TraderSettingsModal);
