import React from 'react';
import { Trans } from 'react-i18next';

export const TABS = {
  ACCOUNT: 'ACCOUNT',
  SUBACCOUNTS: 'SUBACCOUNTS',
  PREFERENCES: 'PREFERENCES',
  TRANSFERS: 'TRANSFERS',
  HISTORY: 'HISTORY',
  API: 'API',
  REWARDS: 'REWARDS',
  // STAKING: 'STAKING',
  AFFILIATES: 'AFFILIATES',
  // COMPETITIONS: 'COMPETITIONS',
};

export const TABS_TITLES = {
  [TABS.ACCOUNT]: <Trans i18nKey="settings.account.title">Account</Trans>,
  [TABS.SUBACCOUNTS]: <Trans i18nKey="settings.subaccounts.title">Subaccounts</Trans>,
  [TABS.API]: <Trans i18nKey="settings.api.title">API</Trans>,
  [TABS.HISTORY]: <Trans i18nKey="settings.history.title">History</Trans>,
  [TABS.PREFERENCES]: <Trans i18nKey="settings.preferences.title">Preferences</Trans>,
  [TABS.AFFILIATES]: <Trans i18nKey="settings.affiliates.title">Affiliates</Trans>,
  [TABS.REWARDS]: <Trans i18nKey="settings.rewards.title">Rewards & Offers</Trans>,
  //  [TABS.STAKING]: <Trans i18nKey="settings.staking.title">Crypto Staking</Trans>,
  [TABS.TRANSFERS]: <Trans i18nKey="settings.transfers.title">Transfers</Trans>,
  // [TABS.COMPETITIONS]: <Trans i18nKey="settings.competitions.title">Competitions</Trans>,
};

export const TABS_MOBILE = {
  ...TABS_TITLES,
  [TABS.REWARDS]: <Trans i18nKey="settings.rewards.mobile.title">Rewards</Trans>,
};

export const TABS_ROUTES = Object.values(TABS).reduce(
  (map, value) => ({ ...map, [value]: `/settings/${value.toLowerCase()}` }),
  {}
);
