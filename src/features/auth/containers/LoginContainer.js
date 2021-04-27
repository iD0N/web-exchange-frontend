import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Cookies, withCookies } from 'react-cookie';
import { connect } from 'react-redux';

import { connectSpinner } from '../../../common/services/spinner';
import { loginActions } from '../../../common/services/user';

import { apiCallIds } from '../api';
import Login from '../components/Login';
import { show } from 'redux-modal';
import axios from 'axios';
import { IP_FILTER_MODAL_ID } from '../components/IPFilterModal';

const EnhancedLogin = connectSpinner({
  isLoading: apiCallIds.LOGIN,
})(Login);

const mapDispatchToProps = {
  login: loginActions.request,
  displayIPFilterModal: () => show(IP_FILTER_MODAL_ID),
};

class LoginContainer extends Component {
  static propTypes = {
    cookies: PropTypes.instanceOf(Cookies).isRequired,
    login: PropTypes.func.isRequired,
  };

  componentDidMount() {

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
    const { login } = this.props;

    return <EnhancedLogin onSubmit={login} />;
  }
}

export default withCookies(connect(undefined, mapDispatchToProps)(LoginContainer));
