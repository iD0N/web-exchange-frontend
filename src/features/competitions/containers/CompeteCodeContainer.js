import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Cookies, withCookies } from 'react-cookie';
import localStorage from 'localStorage';
import { withRouter } from 'react-router-dom';
import moment from 'moment';

import { cookieDomainOption, selectStage } from '../../../config';
import { selectIsLoggedIn } from '../../../common/services/user';
import {
  selectCompetitionReferralCode,
  fetchCompetitionReferralCodeActions,
} from '../../settings/components/competitions/ducks';

const mapStateToProps = state => ({
  referralCode: selectCompetitionReferralCode(state),
  isLoggedIn: selectIsLoggedIn(state),
});

const mapDispatchToProps = {
  fetchCompetitionReferralCode: fetchCompetitionReferralCodeActions.request,
};

class CompeteCodeContainer extends Component {
  static propTypes = {
    cookies: PropTypes.instanceOf(Cookies).isRequired,
  };

  componentDidMount() {
    const { cookies, isLoggedIn, fetchCompetitionReferralCode } = this.props;
    const competitionCode = this.getCompetitionCode();
    const referralCode = this.getReferralCode();

    if (!competitionCode) {
      this.redirectToCompete();
      return;
    }
    cookies.set(`competitionCode_${selectStage()}`, competitionCode, {
      expires: moment()
        .add(1, 'days')
        .toDate(),
      ...cookieDomainOption(),
    });
    try {
      localStorage.setItem(`competitionCode_${selectStage()}`, competitionCode);
    } catch (err) {}

    if (isLoggedIn) {
      this.redirectToCompete();
      return;
    }

    if (referralCode) {
      cookies.set('referralCode', referralCode, {
        expires: moment()
          .add(1, 'days')
          .toDate(),
        ...cookieDomainOption(),
      });
      this.redirectToCompete(referralCode);
      return;
    }

    fetchCompetitionReferralCode(competitionCode);
  }

  componentDidUpdate({ referralCode }) {
    if (!referralCode && this.props.referralCode) {
      this.props.cookies.set('referralCode', this.props.referralCode, {
        expires: moment()
          .add(1, 'days')
          .toDate(),
        ...cookieDomainOption(),
      });
      this.redirectToCompete(this.props.referralCode);
    }
  }

  getCompetitionCode = () => this.props.match.params.code;

  getReferralCode = () => {
    const { pathname } = window.location;
    const parts = pathname.split('/').filter(a => !!a);

    if (parts.length === 3) {
      const [referralCode] = parts.splice(-1);
      return referralCode;
    }

    return false;
  };

  redirectToCompete = referralCode =>
    !!referralCode && referralCode !== 'null'
      ? this.props.history.push(`/auth/sign-up/${referralCode}`)
      : this.props.history.push('/compete');

  render() {
    return null;
  }
}

export default withRouter(
  withCookies(connect(mapStateToProps, mapDispatchToProps)(CompeteCodeContainer))
);
