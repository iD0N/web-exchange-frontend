import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import cn from 'classnames';

import { isTestnet } from '../../../../../../config';
// import { truncateString } from '../../../../../../common/utils/stringHelpers';
import { FontIcon, Icon } from '../../../../../../common/components';
import { Dropdown, Menu } from '../../../../../../common/components/trader';
import { layouts } from '../../../../layout-manager/widgetConfigs';
import AccountSummary from '../../../../features/account-summary';

const { Item: MenuItem, SubMenu, Divider } = Menu;

const align = { offset: [0, 0] };

const Nav = ({
  accounts,
  alias,
  isLoggedIn,
  history,
  isMobile,
  onResetLayoutClick,
  competitions,
  listLoaded,
  hasFundsTransfer,
  languageDropdown,
  setTraderId,
}) => (
  <Dropdown
    align={align}
    fullHeight
    hoverTrigger
    placement="bottomRight"
    className="account-settings-trigger"
    overlayClassName="account-settings-overlay"
    getPopupContainer={trigger => (trigger.parentNode ? trigger.parentNode : document.body)}
    overlay={
      <Menu className="full-height">
        {isMobile && isLoggedIn && (
          <MenuItem>
            <AccountSummary />
          </MenuItem>
        )}
        {isMobile && (
          <MenuItem className="submenu-nav-item submenu-nav-item-language-dropdown">
            {languageDropdown}
          </MenuItem>
        )}
        {isLoggedIn && (
          <MenuItem className="submenu-nav-item">
            <Link to="/settings/account">
              <FontIcon type="menu-copy" />
              <Trans i18nKey="nav.accountSettings">Account Settings</Trans>
            </Link>
          </MenuItem>
        )}
        {isLoggedIn && (
          <SubMenu
            title={
              <Link to="/settings/subaccounts">
                <FontIcon type="reports" />
                <Trans i18nKey="nav.subaccounts.title">Subaccounts</Trans>
              </Link>
            }
          >
            {accounts.map(({ displayName, isSelectedTraderId, traderId }) => (
              <MenuItem
                key={traderId}
                onClick={() => {
                  if (isSelectedTraderId) {
                    return;
                  }
                  setTraderId(traderId);
                }}
              >
                <span className={cn({ 'nav-subaccount-active': isSelectedTraderId })}>
                  {displayName}
                </span>
              </MenuItem>
            ))}
            {accounts.length > 0 && <Divider />}
            <MenuItem>
              <Link to="/settings/subaccounts">
                <Trans i18nKey="nav.subaccounts.manage">Manage Subaccounts</Trans>
              </Link>
            </MenuItem>
          </SubMenu>
        )}
        {isLoggedIn && !isTestnet() && (
          <MenuItem className="submenu-nav-item">
            <Link to="/settings/transfers">
              <FontIcon type="deposit" />
              <Trans i18nKey="nav.transfers">Transfers</Trans>
            </Link>
          </MenuItem>
        )}
        <MenuItem className="submenu-nav-item">
          <Link to="/summary">
            <Icon type="fund" />
            <Trans i18nKey="nav.marketSummary">Market Summary</Trans>
          </Link>
        </MenuItem>
        {isLoggedIn && (
          <MenuItem className="submenu-nav-item">
            <Link to="/settings/rewards">
              <Icon type="trophy" />
              <Trans i18nKey="nav.rewardsAndOffers">Rewards & Offers</Trans>
            </Link>
          </MenuItem>
        )}
        {/* isLoggedIn && (
          <MenuItem className="submenu-nav-item">
            <Link to="/settings/staking">
              <Icon type="cloud" />
              <Trans i18nKey="nav.staking">Crypto Staking</Trans>
            </Link>
          </MenuItem>
        )*/}
        {isLoggedIn && (
          <MenuItem className="submenu-nav-item">
            <Link to="/settings/affiliates">
              <FontIcon type="orders" />
              <Trans i18nKey="nav.referAndEarn">Refer & Earn</Trans>
            </Link>
          </MenuItem>
        )}
        {/*isMobile && isLoggedIn && (
          <MenuItem className="submenu-nav-item">
            <Link to="/settings/competitions">
              <FontIcon type="reports" />
              <Trans i18nKey="nav.competitions">Competitions</Trans>
            </Link>
          </MenuItem>
        )*/}
        {/*isLoggedIn && (
          <MenuItem className="submenu-nav-item">
            <Link to="/leaderboard">
              <Icon type="ordered-list" />
              <Trans i18nKey="nav.leaderboard">Leaderboard</Trans>
            </Link>
          </MenuItem>
        )*/}
        {/*!isMobile && isLoggedIn && (
          <SubMenu
            title={
              <Link to="/settings/competitions">
                <FontIcon type="reports" />
                <Trans i18nKey="nav.competitions">Competitions</Trans>
              </Link>
            }
          >
            {competitions.map(({ competitionId, label }) => (
              <MenuItem key={competitionId}>
                <Link to={`/competition/${competitionId}`}>{truncateString(label, 100)}</Link>
              </MenuItem>
            ))}
            {competitions.length > 0 && <Divider />}
            <MenuItem>
              <Link to="/settings/competitions">
                <FontIcon type="plus" />
                <Trans i18nKey="nav.createCompetition">Create a Competition</Trans>
              </Link>
            </MenuItem>
          </SubMenu>
        )*/}
        {isLoggedIn && (
          <MenuItem className="submenu-nav-item">
            <Link to="/settings/api">
              <FontIcon type="settings" />
              <Trans i18nKey="nav.api.title">API</Trans>
            </Link>
          </MenuItem>
        )}
        {!isMobile && (
          <SubMenu
            className="submenu-nav-item"
            title={
              <>
                <FontIcon type="interface" />
                <Trans i18nKey="nav.workspace.title">Workspace</Trans>
              </>
            }
          >
            <MenuItem onClick={() => onResetLayoutClick(layouts.STANDARD)}>
              <Trans i18nKey="nav.workspace.resetLayoutDefault">Reset to "Default"</Trans>
            </MenuItem>
          </SubMenu>
        )}
        {/*!isTestnet() && !window.ReactNativeWebView && (
          <MenuItem className="submenu-nav-item">
            <a href={selectRootUrl(BETA)}>
              <FontIcon type="link-to" />
              <Trans i18nKey="nav.goToTestnet">Go to Testnet</Trans>
            </a>
          </MenuItem>
        )*/}
        {/*!isLoggedIn && (
          <MenuItem className="submenu-nav-item">
            <Link to="/leaderboard">
              <Icon type="ordered-list" />
              <Trans i18nKey="nav.leaderboard">Leaderboard</Trans>
            </Link>
          </MenuItem>
        )*/}
        <MenuItem className="submenu-nav-item">
          <a href="https://support.crypto.io" target="_blank" rel="noopener noreferrer">
            <FontIcon type="info" />
            <Trans i18nKey="nav.helpAndSupport">Help & Support</Trans>
          </a>
        </MenuItem>
        {isLoggedIn && (
          <MenuItem className="submenu-nav-item">
            <Link to="/auth/logout">
              <FontIcon type="logout-copy" />
              <Trans i18nKey="nav.logout">Logout</Trans>
            </Link>
          </MenuItem>
        )}
        {!isLoggedIn && (
          <MenuItem className="submenu-nav-item">
            <Link to="/auth/login?redirect=/trader">
              <Icon type="login" />
              <Trans i18nKey="nav.login">Login</Trans>
            </Link>
          </MenuItem>
        )}
        {!isLoggedIn && (
          <MenuItem className="submenu-nav-item">
            <Link to="/auth/sign-up">
              <Icon type="user" />
              <Trans i18nKey="nav.signup">Sign Up</Trans>
            </Link>
          </MenuItem>
        )}
      </Menu>
    }
  >
    <FontIcon type="menu-copy" />
    <span className="username">{alias}</span>
  </Dropdown>
);

Nav.propTypes = {
  accounts: PropTypes.array.isRequired,
  alias: PropTypes.string.isRequired,
  isLoggedIn: PropTypes.bool,
  isMobile: PropTypes.bool,
  onResetLayoutClick: PropTypes.func.isRequired,
};

export default Nav;
