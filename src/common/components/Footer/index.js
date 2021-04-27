import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { translate, Trans } from 'react-i18next';

// import config from '../../../config';
import { LANGUAGES } from '../../../common/services/i18n';
import {
  Layout,
  Container,
  Row,
  Col,
  SocialIconLink,
  Logo,
  MarketingLink,
} from '../../../common/components';

// const { baseURL } = config();

const Footer = ({ i18n, isLoggedIn }) => (
  <Layout.Footer>
    <Container>
      <Row>
        <Col md={8}>
          <Logo dark />
        </Col>
        <Col md={16}>
          <ul className="social-links">
            <li>
              <SocialIconLink href={LANGUAGES[i18n.language].telegramLink} className="telegram" />
            </li>
            <li>
              <SocialIconLink href="https://www.twitter.com/crypto_io" className="twitter" />
            </li>
            <li>
              <SocialIconLink href="https://www.reddit.com/r/crypto_io" className="reddit" />
            </li>
            <li>
              <SocialIconLink href="http://www.facebook.com/crypto_io" className="facebook" />
            </li>
            <li>
              <SocialIconLink href="https://www.linkedin.com/company/crypto" className="linkedin" />
            </li>
            <li>
              <SocialIconLink href="https://github.com/cryptoio" className="github" />
            </li>
          </ul>
        </Col>
      </Row>
      <nav>
        {/*
          split rendering into 2 chunks with some duplication, because currently
          a user who is both logged in AND does not have the trader app flag will
          get an empty column, and we want to suppress this

          TODO fold this back together into one rendering mode once we remove
          this case, and can do enablement on an item-by-item basis again
        */}
        <ul>
          <li>
            <strong>
              <Trans i18nKey="footerNav.exchange.title">Exchange</Trans>
            </strong>
          </li>
          {!isLoggedIn && (
            <>
              <li>
                <NavLink to="/auth/login">
                  <Trans i18nKey="footerNav.exchange.login">Login</Trans>
                </NavLink>
              </li>
              <li>
                <NavLink to="/auth/sign-up">
                  <Trans i18nKey="footerNav.exchange.signup">Sign Up</Trans>
                </NavLink>
              </li>
            </>
          )}
          {/*<li>
            <MarketingLink to="affiliate-program-services-agreement">
              <Trans i18nKey="footerNav.exchange.affiliates">Affiliates</Trans>
            </MarketingLink>
          </li>*/}
        </ul>
        <ul>
          <li>
            <strong>
              <Trans i18nKey="footerNav.company.title">Company</Trans>
            </strong>
          </li>
          <li>
            <MarketingLink to="home">
              <Trans i18nKey="footerNav.company.home">Home</Trans>
            </MarketingLink>
          </li>
          {/*<li>
            <a href={LANGUAGES[i18n.language].blogLink} target="_blank" rel="noopener noreferrer">
              <Trans i18nKey="footerNav.company.blog">Blog</Trans>
            </a>
          </li>*/}
          {/*<li>
            <MarketingLink to="news">
              <Trans i18nKey="footerNav.company.press">Press</Trans>
            </MarketingLink>
          </li>*/}
          {/*<li>
            <a href="https://careers.crypto.io" target="_blank" rel="noopener noreferrer">
              <Trans i18nKey="footerNav.company.careers">Careers</Trans>
            </a>
          </li>*/}
        </ul>
        <ul>
          <li>
            <strong>
              <Trans i18nKey="footerNav.more.title">More</Trans>
            </strong>
          </li>
          {/*<li>
            <a href={`${baseURL}/assets/whitepaper-${i18n.language}.pdf`}>
              <Trans i18nKey="footerNav.more.whitepaper">Whitepaper</Trans>
            </a>
          </li>*/}
          <li>
            <a href="https://docs.crypto.io" target="_blank" rel="noopener noreferrer">
              <Trans i18nKey="footerNav.more.api">API</Trans>
            </a>
          </li>
          <li>
            <a href="https://support.crypto.io" target="_blank" rel="noopener noreferrer">
              <Trans i18nKey="footerNav.more.support">Help & Support</Trans>
            </a>
          </li>
        </ul>
      </nav>
      <ul className="info">
        <li>
          <Trans i18nKey="footer.copyright">© 2020 crypto</Trans>
        </li>
        <li>
          <MarketingLink to="https://support.crypto.io/hc/en-us/articles/360053243834-Privacy-Policy" blank>
            <Trans i18nKey="footerNav.privacyPolicy">Privacy Policy</Trans>
          </MarketingLink>
        </li>
        <li>
          <MarketingLink to="https://support.crypto.io/hc/en-us/articles/360053243874-Terms-of-service" blank>
            <Trans i18nKey="footerNav.termsAndConditions">Terms and conditions</Trans>
          </MarketingLink>
        </li>
        {<li>
          <MarketingLink to="https://support.crypto.io/hc/en-us/articles/360053580713-Referral-Program" blank>
            <Trans i18nKey="footerNav.affiliateProgram">Referral Program Terms</Trans>
          </MarketingLink>
        </li>}
      </ul>
    </Container>
  </Layout.Footer>
);

Footer.propTypes = {
  i18n: PropTypes.object.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
};

export default translate()(Footer);
