import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { show } from 'redux-modal';
import { Link } from 'react-router-dom';
import { Cookies, withCookies } from 'react-cookie';
import localStorage from 'localStorage';
import i18next from 'i18next';

import {
  BETA,
  cookieDomainOption,
  getStage,
  isProd,
  isTestnet,
  PROD,
  selectStage,
  selectRootUrl,
} from '../../../../../config';
import {
  fetchAccountsAction,
  selectAccountTraderId,
  selectAccounts,
} from '../../../../../common/services/accounts';
import { Icon, Logo, IsMobile, LanguageDropdown } from '../../../../../common/components';
import { Button, ButtonLink, Layout } from '../../../../../common/components/trader';
import { selectAccountAlias } from '../../../../../common/services/accounts';
import { connectSpinner } from '../../../../../common/services/spinner';
import {
  selectHasFundsTransfer,
  selectUserEmail,
  setTraderIdAction,
  changeLocaleAction,
  selectUserAttributes,
} from '../../../../../common/services/user';
import IsLoggedIn from '../../../../../common/services/user/IsLoggedIn';
import { apiCallIds } from '../../../../../common/services/user/api';
import { resetLayoutAction } from '../../../layout-manager/ducks';
import {
  joinCompetitionIfAbleActions,
  selectCompetitionsListLoaded,
  selectActiveCompetitions,
  fetchCompetitionsActions,
} from '../../../../settings/components/competitions/ducks';
import AccountSummary from '../../../features/account-summary';
import NotificationTray from '../../../features/notification-tray';
import { MOBILE_INFO_MODAL } from '../../../features/mobile-info';
import { OrderEntryConsumer } from '../../../features/order-entry/OrderEntryContext';

import ChannelSubscription from '../../../ws-subscription/containers/ChannelSubscription';
import { WS_CHANNELS } from '../../../constants';
import { selectGlobalContractCode } from '../../../data-store/ducks';

import Nav from './Nav';

let fetchedAccounts = false;

const mapStateToProps = state => ({
  alias: selectAccountAlias(state) || selectUserEmail(state), // TODO: just selectAlias when generated
  globalContractCode: selectGlobalContractCode(state),
  hasFundsTransfer: selectHasFundsTransfer(state),
  traderIdReady: !!selectAccountTraderId(state),
  listLoaded: selectCompetitionsListLoaded(state),
  competitions: selectActiveCompetitions(state),
  accounts: selectAccounts(state),
  userAttributes: selectUserAttributes(state),
});

const mapDispatchToProps = {
  fetchAccounts: fetchAccountsAction.request,
  resetLayout: resetLayoutAction,
  handleChangeLocale: changeLocaleAction,
  joinCompetitionIfAble: joinCompetitionIfAbleActions,
  fetchCompetitions: fetchCompetitionsActions.request,
  setTraderId: setTraderIdAction,
  showMobileInfoModal: props => show(MOBILE_INFO_MODAL, props),
};

class Header extends Component {
  static propTypes = {
    alias: PropTypes.string.isRequired,
    cookies: PropTypes.instanceOf(Cookies).isRequired,
    fetchAccounts: PropTypes.func.isRequired,
    inSettingsApp: PropTypes.bool,
    isLoggedIn: PropTypes.bool.isRequired,
    isMobile: PropTypes.bool.isRequired,
    resetLayout: PropTypes.func.isRequired,
    handleChangeLocale: PropTypes.func.isRequired,
  };

  getCurrentLocale = () => {
    const { locale } = this.props.userAttributes;
    if (locale) {
      return locale;
    }
    return i18next.language || window.localStorage.i18nextLng;
  };

  componentDidMount() {
    if (this.props.isLoggedIn) {
      fetchedAccounts = true;
      this.props.fetchAccounts();
    }
    if (this.props.traderIdReady) {
      this.attemptJoin();
      if (!this.props.listLoaded) {
        this.props.fetchCompetitions();
      }
    }
  }

  componentDidUpdate({ traderIdReady: wasReady }) {
    if (!wasReady && this.props.traderIdReady) {
      this.attemptJoin();
      if (!this.props.listLoaded) {
        this.props.fetchCompetitions();
      }
    } else if (this.props.isLoggedIn && !fetchedAccounts) {
      fetchedAccounts = true;
      this.props.fetchAccounts();
    }
  }

  attemptJoin = () => {
    const { cookies, joinCompetitionIfAble } = this.props;

    let code = cookies.get(`competitionCode_${selectStage()}`, cookieDomainOption());
    try {
      if (!code) {
        code = localStorage.getItem(`competitionCode_${selectStage()}`);
      }
    } catch (err) {}
    if (!code) {
      if (isProd() || isTestnet()) {
        const altEnvironment = isProd() ? BETA : PROD;
        code = cookies.get(`competitionCode_${altEnvironment}`, cookieDomainOption());
        if (code) {
          window.location.href = `${selectRootUrl(altEnvironment)}/compete/${code}`;
        }
      }
      return;
    }
    cookies.remove(`competitionCode_${selectStage()}`, cookieDomainOption());
    try {
      localStorage.removeItem(`competitionCode_${selectStage()}`);
    } catch (err) {}

    joinCompetitionIfAble({ code });
  };

  render() {
    const {
      accounts,
      alias,
      globalContractCode,
      inSettingsApp,
      isLoggedIn,
      isLoggingIn,
      isMobile,
      resetLayout,
      competitions,
      listLoaded,
      hasFundsTransfer,
      showMobileInfoModal,
      setTraderId,
    } = this.props;

    return (
      <OrderEntryConsumer>
        {({ handleToggle }) => (
          <ChannelSubscription channel={WS_CHANNELS.COLLATERAL_PRICES}>
            <ChannelSubscription channel={WS_CHANNELS.POSITIONS}>
              <Layout.Header isTestnet={isTestnet()}>
                <div className="left-part">
                  <Logo path="/summary" />
                  <Link
                    to={`/trader/${globalContractCode}`}
                    className="exchange-link"
                    id="exchange-link"
                  >
                    {inSettingsApp ? 'TRADE' : !isProd() ? (isMobile ? null : getStage()) : null}
                  </Link>
                </div>
                {!isLoggedIn && !isLoggingIn && !inSettingsApp && (
                  <>
                    <ButtonLink className="signup" to="/auth/sign-up">
                      <Trans i18nKey="nav.signup">Sign Up</Trans>
                    </ButtonLink>
                    <ButtonLink className="login" ghost to="/auth/login?redirect=/trader">
                      <Trans i18nKey="nav.login">Login</Trans>
                    </ButtonLink>
                  </>
                )}
                <div className="right-part">
                  {isLoggedIn && isMobile && !inSettingsApp && (
                    <Button ghost onClick={() => showMobileInfoModal()}>
                      <Icon type="sliders" theme="outlined" />
                      <Trans i18nKey="nav.info">Info</Trans>
                    </Button>
                  )}
                  {isLoggedIn && !isMobile && <AccountSummary />}
                  {isLoggedIn && <NotificationTray />}
                  {!isMobile && <LanguageDropdown
                    flagOnly
                    value={this.getCurrentLocale()}
                    onChange={locale => this.props.handleChangeLocale({ locale })}
                  />}
                  <Nav
                    accounts={accounts}
                    alias={alias}
                    isMobile={isMobile}
                    isLoggedIn={isLoggedIn}
                    onResetLayoutClick={resetLayout}
                    competitions={competitions}
                    listLoaded={listLoaded}
                    hasFundsTransfer={hasFundsTransfer}
                    setTraderId={setTraderId}
                    languageDropdown={<LanguageDropdown
                      value={this.getCurrentLocale()}
                      onChange={locale => this.props.handleChangeLocale({ locale })}
                    />}
                  />
                </div>
              </Layout.Header>
            </ChannelSubscription>
          </ChannelSubscription>
        )}
      </OrderEntryConsumer>
    );
  }
}

const EnhancedHeader = connectSpinner({
  isLoggingIn: apiCallIds.FETCH_USER_PROFILE,
})(Header);

export default withCookies(
  connect(mapStateToProps, mapDispatchToProps)(IsLoggedIn(IsMobile(EnhancedHeader)))
);
