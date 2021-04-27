import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Cookies, withCookies } from 'react-cookie';
import localStorage from 'localStorage';
import moment from 'moment';
import { Trans } from 'react-i18next';
import { show } from 'redux-modal';
import axios from 'axios';

import { cookieDomainOption } from '../../../config';
import { connectSpinner } from '../../../common/services/spinner';
import i18n, { CHINESE } from '../../../common/services/i18n';

import { signUpAction } from '../ducks';
import { apiCallIds } from '../api';
import SignUp from '../components/SignUp';

import { IP_FILTER_MODAL_ID } from '../components/IPFilterModal';

const EnhancedSignUp = connectSpinner({
  isLoading: apiCallIds.SIGN_UP,
})(SignUp);

const mapStateToProps = (
  _,
  {
    cookies,
    match: {
      params: { referralCode = cookies.get('referralCode', cookieDomainOption()) },
    },
  }
) => ({
  hasReferral: !!referralCode && referralCode.length > 1,
});

const mapDispatchToProps = {
  signUp: signUpAction,
  displayIPFilterModal: () => show(IP_FILTER_MODAL_ID),
};

class SignUpContainer extends Component {
  static propTypes = {
    cookies: PropTypes.instanceOf(Cookies).isRequired,
    hasReferral: PropTypes.bool.isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({
        referralCode: PropTypes.string,
      }),
    }),
    signUp: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      isMobileNumber: i18n.language === CHINESE,
    };
  };

  componentDidMount() {
    const {
      cookies,
      hasReferral,
      match: {
        params: { referralCode: routeReferralCode },
      },
    } = this.props;

    if (hasReferral && routeReferralCode) {
      cookies.set('referralCode', routeReferralCode, {
        expires: moment()
          .add(2, 'weeks')
          .toDate(),
        ...cookieDomainOption(),
      });
      try {
        localStorage.setItem('referralCode', routeReferralCode);
      } catch (err) {}
    }

    //IP filtering check
    // axios.get(`https://ip-api.com/json`)
    axios.get(`https://ipapi.co/json`)
      .then(res => {

        // for ip-api.com
        // let ipAddr = res.data.query
        // let countryCode = res.data.countryCode

        let ipAddr = res.data.ip
        let countryCode = res.data.country_code
        let ipWhitelist = this.props.variation

        let blockedCountryCodes = [
          'HK', //Hong Kong
          'CU', //Cuba
          'IR', //Iran
          'KP', //North Korea
          //Crimea (N/A)
          'SS', //South Sudan
          'SD', //Sudan
          'MY', //Malaysia
          'SY', //Syria
          'US', //USA
          'UM', //United States Minor Outlying Islands
          'VI', //US Virgin Islands
          'AS', //US American Samoa
          'GU', //US Guam
          'MP', //US Northern Mariana Islands (the)
          'PR', //US Puerto Rico
          'BD', //Bangladesh
          'BO', //Bolivia
          'EC', //Ecuador
          'KG', //Kyrgyzstan
        ]

        if (blockedCountryCodes.includes(countryCode)) {
          if (ipWhitelist.includes(ipAddr)) {
          } else {
            this.props.displayIPFilterModal()
          }
        } else {
          // console.log('incoming ip check passes');
        }
      })
  }

  render() {
    const { signUp, hasReferral } = this.props;

    return (
      <EnhancedSignUp
        hasReferral={hasReferral}
        isMobileNumber={this.state.isMobileNumber}
        setIsMobileNumber={value => this.setState({ isMobileNumber: value })}
        onSubmit={signUp} 
      />
    )
  }
}

export default withCookies(
  withRouter(connect(mapStateToProps, mapDispatchToProps)(SignUpContainer))
);
