import React from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';
import { NavLink, Link } from 'react-router-dom';

import config from '../../../../config';

import { LANGUAGES } from '../../../../common/services/i18n';
import { ButtonLink, Menu, Icon, Header, Dropdown } from '../../../../common/components';
import IsLoggedIn from '../../../../common/services/user/IsLoggedIn';

const { Item: MenuItem } = Menu;

const { baseURL } = config();

const AccountHeader = ({ isIdentity, isLoggedIn, i18n }) => (
  <Header>
    {({ isCollapsedNav }) =>
      !isIdentity ? (
        [
          <MenuItem key="trader" className="primary">
            <NavLink to="/trader">
              <Trans i18nKey="nav.testnet">Testnet</Trans>
            </NavLink>
          </MenuItem>,
          isLoggedIn && (
            <MenuItem key="account">
              <NavLink to="/settings/account">
                <Trans i18nKey="nav.accountSettings">Account Settings</Trans>
              </NavLink>
            </MenuItem>
          ),
          <MenuItem key="affiliate">
            <a
              href="https://promotions.crypto.io/affiliate"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Trans i18nKey="nav.affiliateProgram">Referral Program</Trans>
            </a>
          </MenuItem>,
          <MenuItem key="blog">
            <a href={LANGUAGES[i18n.language].blogLink} target="_blank" rel="noopener noreferrer">
              <Trans i18nKey="nav.blog">Blog</Trans>
            </a>
          </MenuItem>,
          <MenuItem key="news">
            <a href="https://press.crypto.io" target="_blank" rel="noopener noreferrer">
              <Trans i18nKey="nav.press">Press</Trans>
            </a>
          </MenuItem>,
          <MenuItem key="resources">
            <Dropdown
              overlayClassName="header-dropdown-overlay-wrapper"
              overlay={
                <Menu>
                  <Menu.Item>
                    <a href={`${baseURL}/assets/whitepaper-${i18n.language}.pdf`}>
                      <Trans i18nKey="nav.docs.whitepaper">Whitepaper</Trans>
                    </a>
                  </Menu.Item>
                  <Menu.Item>
                    <a href="https://docs.crypto.io">
                      <Trans i18nKey="nav.api.title">API</Trans>
                    </a>
                  </Menu.Item>
                  <Menu.Item>
                    <a href="https://support.crypto.io">
                      <Trans i18nKey="nav.resources.support">Help & Support</Trans>
                    </a>
                  </Menu.Item>
                </Menu>
              }
            >
              <span>
                <Trans i18nKey="nav.resources.title">Resources</Trans> <Icon type="down" />
              </span>
            </Dropdown>
          </MenuItem>,
          !isLoggedIn && (
            <MenuItem key="signup" className="btn-item btn-item-auth">
              <ButtonLink className="btn-auth signup" to="/auth/sign-up">
                <Trans i18nKey="nav.signup">Sign Up</Trans>
              </ButtonLink>
            </MenuItem>
          ),
          !isLoggedIn && (
            <MenuItem key="login" className="btn-item btn-item-auth">
              <ButtonLink className="btn-auth login" to="/auth/login">
                <Trans i18nKey="nav.login">Log In</Trans>
              </ButtonLink>
            </MenuItem>
          ),
          isLoggedIn && isLoggedIn && (
            <MenuItem key="logout" className="logout">
              <NavLink to="/auth/logout">
                {isCollapsedNav ? (
                  <Trans i18nKey="nav.logout">Logout</Trans>
                ) : (
                  <Icon type="poweroff" />
                )}
              </NavLink>
            </MenuItem>
          ),
        ]
      ) : (
        <MenuItem className="primary">
          <Link to="/">
            <Trans i18nKey="nav.backHome">Back to Home</Trans>
          </Link>
        </MenuItem>
      )
    }
  </Header>
);

AccountHeader.propTypes = {
  i18n: PropTypes.object.isRequired,
  IsLoggedIn: PropTypes.bool,
  isIdentity: PropTypes.bool.isRequired,
};

export default translate()(IsLoggedIn(AccountHeader));
