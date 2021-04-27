import React from 'react';
import PropTypes from 'prop-types';
import { Trans, translate } from 'react-i18next';

import { Alert, Widget, Button, Form } from '../../../../../common/components';

import Recaptcha from './Recaptcha';

const KYCIntro = ({
  recaptchaSitekey,
  recaptchaError,
  hasRecaptcha,
  isLoading,
  onRecaptchaChange,
  onRecaptchaError,
  onSubmit,
  i18n,
}) => (
  <Widget className="kyc-intro" title={<Trans i18nKey="kycIntro.title">Getting Started</Trans>}>
    <p>
      <Trans i18nKey="kycIntro.requirements.intro">
        In order to verify your identity and start trading on Crypto, you will need the following:
      </Trans>
    </p>
    <ul>
      <li>
        <Trans i18nKey="kycIntro.requirements.identityCard">
        A digital photo of your government-issued ID (e.g. passport or driver's license) - it must have a photo of you on it.
        </Trans>
      </li>
      <li>
        <Trans i18nKey="kycIntro.requirements.digitalPhoto">
        A photo of yourself, with your entire face visible and without any accessories such as glasses when taking the photo. The photo should be well lit and in focus.
        </Trans>
      </li>    
      <li>
        <Trans i18nKey="kycIntro.requirements.usCitizens">
        Unfortunately, for now, we do not serve customers in the following countries/regions/territories: Hong Kong, Cuba, Iran, North Korea, Crimea, Sudan, Malaysia, Syria, USA [including all USA territories like Puerto Rico, American Samoa, Guam, Northern Mariana Island, and the US Virgin Islands (St. Croix, St. John and St. Thomas)], Bangladesh, Bolivia, Ecuador, and Kyrgyzstan. We hope to be able to enable Crypto access for more markets and jurisdictions in the future.
        </Trans>
      </li>
    </ul>
    <Form>
      <Form.Item>
        {recaptchaError ? (
          <Alert
            description={
              <Trans i18nKey="kycIntro.recaptchaError.description">
                There was an error while loading ReCaptcha. Please refresh the page to try again.
              </Trans>
            }
            message={
              <Trans i18nKey="kycIntro.recaptchaError.message">
                ReCaptcha initialization failed
              </Trans>
            }
            type="error"
          />
        ) : (
          <Recaptcha
            sitekey={recaptchaSitekey}
            locale={i18n.language}
            onChange={onRecaptchaChange}
            onError={onRecaptchaError}
            onExpired={() => onRecaptchaChange(null)}
          />
        )}
      </Form.Item>      
      <Button block type="primary" loading={isLoading} disabled={!hasRecaptcha} onClick={onSubmit}>
        <Trans i18nKey="kycIntro.continue">Continue</Trans>
      </Button>
    </Form>
  </Widget>
);

KYCIntro.propTypes = {
  recaptchaSitekey: PropTypes.string.isRequired,
  hasRecaptcha: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onRecaptchaChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  i18n: PropTypes.object.isRequired,
};

export default translate()(KYCIntro);
