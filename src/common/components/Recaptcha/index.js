// Taken from https://github.com/evenchange4/react-grecaptcha
// hardcoded google.com domain replaced with recaptcha.net (to have global support)

import React, { Component } from 'react';
import PropTypes from 'prop-types';

const ID = '_grecaptcha.element.id';
const CALLBACK_NAME = '_grecaptcha.data-callback';
const EXPIRED_CALLBACK_NAME = '_grecaptcha.data-expired-callback';

const removeChild = elem => elem.parentNode && elem.parentNode.removeChild(elem);

class Recaptcha extends Component {
  static propTypes = {
    sitekey: PropTypes.string.isRequired,
    className: PropTypes.string.isRequired,
    size: PropTypes.oneOf(['compact', 'normal']).isRequired,
    locale: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onExpired: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
  };

  static defaultProps = {
    locale: 'en',
    size: 'normal',
    className: 'g-recaptcha',
    onError: error => {
      throw new URIError(`The script ${error.target.src} is not accessible.`);
    },
  };

  componentDidMount() {
    const { locale, onChange, onExpired, onError } = this.props;

    const head = document.head || document.getElementsByTagName('head')[0];
    const script = document.createElement('script');

    script.id = ID;
    script.src = `https://recaptcha.net/recaptcha/api.js?hl=${locale}`;
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;
    script.onerror = onError;
    head.appendChild(script);

    window[CALLBACK_NAME] = onChange;
    window[EXPIRED_CALLBACK_NAME] = onExpired;
  }

  componentWillUnmount() {
    removeChild(document.getElementById(ID));
  }

  render() {
    const { className, sitekey, size } = this.props;

    return (
      <div
        className={className}
        data-sitekey={sitekey}
        data-size={size}
        data-callback={CALLBACK_NAME}
        data-expired-callback={EXPIRED_CALLBACK_NAME}
      />
    );
  }
}

export default Recaptcha;
