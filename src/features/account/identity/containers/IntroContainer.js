import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import config from '../../../../config';
import { connectSpinner } from '../../../../common/services/spinner';
import { LANGUAGES } from '../../../../common/services/i18n';

import { apiCallIds } from '../api';
import { initiateKycActions } from '../ducks';
import Intro from '../components/Intro';

const EnhancedIntro = connectSpinner({
  isLoading: apiCallIds.INITIATE_KYC,
})(Intro);

const mapDispatchToProps = {
  initiateKyc: initiateKycActions.request,
};

class IntroContainer extends Component {
  static propTypes = {
    i18n: PropTypes.object.isRequired,
    initiateKyc: PropTypes.func.isRequired,
  };

  state = {
    recaptchaError: null,
    recaptchaResponse: null,
  };

  handleRecaptchaChange = recaptchaResponse => {
    this.setState({ recaptchaResponse });
  };

  handleRecaptchaError = recaptchaError => {
    this.setState({ recaptchaError });
  };

  handleSubmit = () => {
    const { i18n } = this.props;
    const { recaptchaResponse } = this.state;

    this.props.initiateKyc({
      recaptchaResponse,
      locale: LANGUAGES[i18n.language].jumioLocale,
      successPath: '/result.html',
      errorPath: '/result.html',
    });
  };

  render() {
    const { recaptchaError, recaptchaResponse } = this.state;

    return (
      <EnhancedIntro
        hasRecaptcha={!!recaptchaResponse}
        recaptchaError={recaptchaError}
        recaptchaSitekey={config().recaptchaSitekey}
        onRecaptchaChange={this.handleRecaptchaChange}
        onRecaptchaError={this.handleRecaptchaError}
        onSubmit={this.handleSubmit}
      />
    );
  }
}

export default translate()(connect(undefined, mapDispatchToProps)(IntroContainer));
