import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import { Cookies, withCookies } from 'react-cookie';

import {} from '../../../../config';
import { getLoginUrl } from '../../../../common/services/amplify';
import SocialButton from '../../../../common/components/SocialButton';

class EnhancedSocialButton extends Component {
  static propTypes = {
    provider: PropTypes.oneOf(['Google', 'Facebook']),
    isSignUp: PropTypes.bool,
    cookies: PropTypes.instanceOf(Cookies).isRequired,
  };

  static defaultProps = {
    isSignUp: false,
  };

  handleRedirect = e => {
    e.preventDefault();
    try {
      Object.keys(this.props.allCookies)
        .filter(name => name.match('CognitoIdentity'))
        .forEach(name => {
          this.props.cookies.remove(name, { path: '/', domain: '.crypto.io' });
        });
    } catch (err) {}
    setTimeout(() => {
      window.location.href = getLoginUrl(this.props.provider);
    }, 50);
  };

  render() {
    const { provider, cookies, allCookies, isSignUp, ...props } = this.props;
    return (
      <SocialButton
        {...props}
        type={provider.toLowerCase()}
        href={getLoginUrl(provider)}
        onClick={this.handleRedirect}
      >
        <span>
          {isSignUp ? (
            <Trans i18nKey="socialButton.signUp.label">Sign Up with {provider}</Trans>
          ) : (
            <Trans i18nKey="socialButton.logIn.label">Login with {provider}</Trans>
          )}
        </span>
      </SocialButton>
    );
  }
}

export default withCookies(EnhancedSocialButton);
