import React from 'react';
import PropTypes from 'prop-types';
import i18next from 'i18next';
import { translate, Trans } from 'react-i18next';

// import config from '../../../../config';
// import { LANGUAGES } from '../../../../common/services/i18n';
import {
  Dropdown,
  Icon,
  Header,
  Menu,
  ButtonLink,
  LanguageDropdown,
} from '../../../../common/components';

const { Item: MenuItem } = Menu;

//  const { baseURL } = config();

const AuthHeader = ({ i18n }) => (
  <Header>
    {({ isCollapsedNav }) => [
      /*
      <MenuItem key="affiliate">
        <a href="https://promotions.crypto.io/affiliate" target="_blank" rel="noopener noreferrer">
          <Trans i18nKey="nav.affiliateProgram">Affiliate Program</Trans>
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
    */
      <MenuItem key="resources">
        <Dropdown
          overlayClassName="header-dropdown-overlay-wrapper"
          overlay={
            <Menu>
              {/*<Menu.Item>
                <a href={`${baseURL}/assets/whitepaper-${i18n.language}.pdf`}>
                  <Trans i18nKey="nav.docs.whitepaper">Whitepaper</Trans>
                </a>
              </Menu.Item>*/}
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
      <MenuItem key="signup" className="btn-item btn-item-auth">
        <ButtonLink className="btn-auth signup" to="/auth/sign-up">
          <Trans i18nKey="nav.signup">Sign Up</Trans>
        </ButtonLink>
      </MenuItem>,
      <MenuItem key="login" className="btn-item btn-item-auth">
        <ButtonLink className="btn-auth login" to="/auth/login">
          <Trans i18nKey="nav.login">Log In</Trans>
        </ButtonLink>
      </MenuItem>,
      <MenuItem className="btn-item" key="language">
        <LanguageDropdown
          wrapperClassName={isCollapsedNav ? 'is-small' : undefined}
          value={i18n.language}
          onChange={lang => i18next.changeLanguage(lang.toLowerCase())}
        />
      </MenuItem>,
    ]}
  </Header>
);

AuthHeader.propTypes = {
  i18n: PropTypes.object.isRequired,
};

export default translate()(AuthHeader);
