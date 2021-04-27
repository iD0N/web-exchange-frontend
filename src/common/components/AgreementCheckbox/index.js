import React, { Component } from 'react';
import { Trans } from 'react-i18next';

import Checkbox from '../Checkbox';
import MarketingLink from '../MarketingLink';

class AgreementCheckbox extends Component {
  render() {
    return (
      <Checkbox className="agreements-checkbox" multiline {...this.props}>
        <Trans i18nKey="agreement">
          By registering, I am agreeing to the Crypto
          <MarketingLink to="https://support.cryptox.io/hc/en-us/articles/360053243874-Terms-of-service" blank>
            Terms of Service
          </MarketingLink>
          ,
          <MarketingLink to="https://support.cryptox.io/hc/en-us/articles/360053243834-Privacy-Policy" blank>
            Privacy Policy
          </MarketingLink>
          and
          <MarketingLink to="https://support.cryptox.io/hc/en-us/articles/360053580713-Referral-Program" blank>
            Referral Program Terms
          </MarketingLink>
          .
        </Trans>
      </Checkbox>
    );
  }
}

export default AgreementCheckbox;
