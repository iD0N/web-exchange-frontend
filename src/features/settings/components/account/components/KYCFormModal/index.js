import React, { Component } from 'react';
import { connectModal } from 'redux-modal';
import { Trans, translate } from 'react-i18next';
import { connect } from 'react-redux';
import axios from 'axios';

import { refreshProfileAction, selectCognitoSub } from '../../../../../../common/services/user';
import {
  Form,
  Input,
  Row,
  Spin,
} from '../../../../../../common/components';
import { Button, ConfirmationModal, Select } from '../../../../../../common/components/trader';
import { completeKycAction } from '../../../../../../features/account/identity/ducks';
import { countryList } from './constants';

export const KYC_FORM_MODAL_ID = 'KYC_FORM_MODAL_ID';

const ConfirmModal = ConfirmationModal(KYC_FORM_MODAL_ID);

const mapStateToprops = state => ({
  userId: selectCognitoSub(state),
});

const mapDispatchToProps = {
  completeKyc: completeKycAction,
  refreshProfile: refreshProfileAction,
};

const TEN_MEGABYTES = 1048576 * 10;

const EIGHTEEN_YEARS = 1000 * 60 * 60 * 24 * 365 * 18;

const isOverEighteen = str => Date.now() - Date.parse(str) > EIGHTEEN_YEARS;
const regex = new RegExp("^[ a-zA-Z -]*$");
const isValidString = str => str ? !!str.match(regex) : true;
const isValidDate = dob => {
  if (!dob) {
    return false;
  }
  const split = dob.split('/');
  if (!split || split.length !== 3 || split[0].length > 2 || split[1].length > 2 || split[2].length !== 4) {
    return false;
  }
  try {
    const parsed = Date.parse(dob);
    return !!parsed;
  } catch(err) { };
  return false;
};

class KYCFormModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disclaimerConfirmed: false,
      formSubmitted: false,
      selfieFile: undefined,
      idFile: undefined,
      firstName: '',
      middleName: '',
      lastName: '',
      dob: '',
      country: countryList[0],
      idNumber: '',
      url: {
        info: false,
        doc: false,
        selfie: false,
      },
      isLoading: false,
    };
  }

  componentDidMount() {
    const { userId } = this.props;

    axios.get(`https://ow043zf98f.execute-api.ap-northeast-1.amazonaws.com/beta/presigned-url?fileName=${userId}/info.txt`)
      .then(res => {
        if (res && res.data && res.data.fileUploadURL) {
          this.setState({ url: { info: res.data.fileUploadURL }});
        }
      });
  }

  canSubmitForm = () => {
    const { 
      selfieFile,
      idFile,
      dob,
      firstName,
      middleName,
      lastName,
      country,
      idNumber,
    } = this.state;

    if (!selfieFile || selfieFile.size > TEN_MEGABYTES) {
      return false;
    }

    if (!idFile || idFile.size > TEN_MEGABYTES) {
      return false;
    }

    if (!!middleName && !isValidString(middleName)) {
      return false;
    }

    return !!firstName && isValidString(firstName) && !!lastName && isValidString(lastName) && isValidDate(dob) && isOverEighteen(dob) && !!country && !!idNumber;
  }

  submitForm = () => {
    const { completeKyc, refreshProfile, userId } = this.props;
    const {
      selfieFile,
      idFile,
      dob,
      firstName,
      middleName,
      lastName,
      country,
      idNumber,
      url: { info: infoUrl },
    } = this.state;

    const info = { firstName, middleName, lastName, dob, country, idNumber };
    this.setState({ isLoading: true }, () => {
      const documentExt = idFile.name.split('.').pop();
      axios.get(`https://ow043zf98f.execute-api.ap-northeast-1.amazonaws.com/beta/presigned-url?fileName=${userId}/document.${documentExt}`)
        .then(res => {
          if (res && res.data && res.data.fileUploadURL) {
            axios({
              method: "PUT",
              url: res.data.fileUploadURL,
              data: idFile,
              headers: { "Content-Type": "multipart/form-data" }
            }).then(res => {
              const selfieExt = selfieFile.name.split('.').pop();
              axios.get(`https://ow043zf98f.execute-api.ap-northeast-1.amazonaws.com/beta/presigned-url?fileName=${userId}/selfie.${selfieExt}`)
                .then(res => {
                  if (res && res.data && res.data.fileUploadURL) {
                    axios({
                      method: "PUT",
                      url: res.data.fileUploadURL,
                      data: selfieFile,
                      headers: { "Content-Type": "multipart/form-data" }
                    }).then(res => {
                      axios({
                        method: "PUT",
                        url: infoUrl,
                        data: info,
                        headers: { "Content-Type": "application/json" }
                      }).then(res => {
                        completeKyc({});
                        setTimeout(() => {
                          refreshProfile();
                          this.setState({ formSubmitted: true })
                        }, 800);
                      });
                    });
                  }
                })                  
            });
          }
      });
    });
  }

  render() {
    const { handleHide, t } = this.props;
    const { disclaimerConfirmed, formSubmitted, isLoading, firstName, middleName, lastName, dob, idNumber, country, idFile, selfieFile, url: { info: infoUrl } } = this.state;
    const loadingUrls = !infoUrl;

    if (formSubmitted) {
      return (
        <ConfirmModal
          wrapClassName="trader-modal-prompt trader-modal-prompt-kyc-form"
          title={
            'Identity Verification Submitted'
          }
          message={
            <div className="disclaimer">
              Thanks for filling out the information. Our team is now working on your request and will notify you via email once the verification is complete.
            </div>
          }
          customCTA={
            <div>
              <div className="btn-wrapper">
                <Button block type="primary" onClick={handleHide}>
                  Okay
                </Button>
              </div>
            </div>
          }
        />
      );
    }

    if (!disclaimerConfirmed) {
      return (
        <ConfirmModal
          wrapClassName="trader-modal-prompt trader-modal-prompt-kyc-form"
          title={
            'Identity Verification'
          }
          message={
            <>
            <div className="disclaimer">
              <div>In order to verify your identity and start trading on Crypto, you will need the following:</div>
              <br />
              <ul>
                <li>- A digital photo of your government-issued ID (e.g. passport or driver's license) - it must have a photo of you on it.</li>
                <li>- A photo of yourself, with your entire face visible and without any accessories such as glasses when taking the photo. The photo should be well lit and in focus.</li>
              </ul>
              <div>Unfortunately, for now, we do not serve customers in the following countries/regions/territories: Hong Kong, Cuba, Iran, North Korea, Crimea, Sudan, Malaysia, Syria, USA [including all USA territories like Puerto Rico, American Samoa, Guam, Northern Mariana Island, and the US Virgin Islands (St. Croix, St. John and St. Thomas)], Bangladesh, Bolivia, Ecuador, and Kyrgyzstan. We hope to be able to enable Crypto access for more markets and jurisdictions in the future.</div>
            </div>
            <div className="btn-wrapper">
              <Button block type="default" ghost onClick={handleHide}>
                <Trans i18nKey="trader.control.cancel">Cancel</Trans>
              </Button>
              <Button block type="primary" onClick={() => this.setState({ disclaimerConfirmed: true })}>
                Continue
              </Button>
            </div>
            </>
          }
          hideCTA
        />
      );
    }

    return (
      <ConfirmModal
        wrapClassName="trader-modal-prompt trader-modal-prompt-kyc-form"
        title={
          'Identity Verification'
        }
        loading={isLoading || loadingUrls}
        message={ loadingUrls || isLoading ? <Spin spinning /> :
          <>
            <Form>
              <div className="token-terms-body">
                <Row>
                  <Form.Item
                    floating
                    id="kyc_first_name"
                    label={<Trans i18nKey="settings.account.fields.firstName">First Name</Trans>}
                  >
                    <Input value={firstName} onChange={({ target: { value: firstName } }) => this.setState({ firstName })} />
                  </Form.Item>
                </Row>
                {!isValidString(firstName) && <Row className="invalid-row"><div className="invalid-value-message">Name value can only contain letters, spaces, and dashes.</div></Row>}
                <Row>
                  <Form.Item
                    floating
                    id="kyc_middle_name"
                    label={<Trans i18nKey="settings.account.fields.middleName">Middle Name (Optional)</Trans>}
                  >
                    <Input value={middleName} onChange={({ target: { value: middleName } }) => this.setState({ middleName })} />
                  </Form.Item>
                </Row>
                {!isValidString(middleName) && <Row className="invalid-row"><div className="invalid-value-message">Name value can only contain letters, spaces, and dashes.</div></Row>}
                <Row>
                  <Form.Item
                    floating
                    id="kyc_last_name"
                    label={<Trans i18nKey="settings.account.fields.lastName">Last Name</Trans>}
                  >
                    <Input value={lastName} onChange={({ target: { value: lastName } }) => this.setState({ lastName })} />
                  </Form.Item>
                </Row>
                {!isValidString(lastName) && <Row className="invalid-row"><div className="invalid-value-message">Name value can only contain letters, spaces, and dashes.</div></Row>}
                <Row>
                  <Form.Item
                    floating
                    id="kyc_dob"
                    label={<Trans i18nKey="settings.account.fields.dateOfBirthShort">Date of Birth</Trans>}
                  >
                    <Input
                      value={dob}
                      onChange={({ target: { value: dob } }) => this.setState({ dob })}
                      placeholder={t('settings.account.fields.dateOfBirth', {
                        defaultValue: 'MM/DD/YYYY',
                      })}
                    />
                  </Form.Item>
                </Row>
                {!!dob
                    ? !isValidDate(dob)
                      ? <Row className="invalid-row"><div className="invalid-value-message">Date must be formatted MM/DD/YYYY.</div></Row>
                      : !isOverEighteen(dob)
                        ? <Row className="invalid-row"><div className="invalid-value-message">You must be over the age of eighteen.</div></Row>
                        : null
                    : null
                }
                <Row className="country-input-wrapper">
                  <Form.Item
                    floating
                    id="kyc_country"
                    label={<Trans i18nKey="settings.account.fields.countryOfResidence">Country of Residence</Trans>}
                  >
                    <Select
                      onChange={country => this.setState({ country })}
                      showSearch
                      optionFilterProp="children"
                      value={country}
                      filterOption={(input, option) => option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    >
                      {countryList.map(country => (<Select.Option key={country} value={country}>{country}</Select.Option>))}
                    </Select>
                  </Form.Item>
                </Row>
                <Row>
                  <Form.Item
                    floating
                    id="kyc_id_number"
                    label={<Trans i18nKey="settings.account.fields.idNumber">Identification #</Trans>}
                  >
                    <Input value={idNumber} onChange={({ target: { value: idNumber } }) => this.setState({ idNumber })} />
                  </Form.Item>
                </Row>
                <Row className="license-upload-wrapper">
                  <Form.Item
                    floating
                    id="license_upload"
                    label={<Trans i18nKey="settings.account.fields.passPortLicense">Passport or License Photo (10MB Max)</Trans>}
                  >
                    <input type="file" onChange={({ target }) => this.setState({ idFile: target.files[0] })} accept="image/*" />
                    {!!idFile && idFile.size > TEN_MEGABYTES && <div className="invalid-value-message">File is too large. Must be smaller than 10 MB.</div>}
                  </Form.Item>
                </Row>
                <Row className="selfie-upload-wrapper">
                  <Form.Item
                    floating
                    id="selfie_upload"
                    label={<Trans i18nKey="settings.account.fields.selfie">Selfie Photo (10MB Max)</Trans>}
                  >
                    <input type="file" onChange={({ target }) => this.setState({ selfieFile: target.files[0] })} accept="image/*" />
                    {!!selfieFile && selfieFile.size > TEN_MEGABYTES && <div className="invalid-value-message">File is too large. Must be smaller than 10 MB.</div>}
                  </Form.Item>
                </Row>
              </div>
            </Form>
            {
              loadingUrls
              ? <></>
              : <div className="kyc-form-btn-wrapper">
                  <div className="btn-wrapper">
                    <Button block type="default" ghost disabled={isLoading} onClick={handleHide}>
                      <Trans i18nKey="trader.control.cancel">Cancel</Trans>
                    </Button>
                    <Button block type="primary" disabled={isLoading || !this.canSubmitForm()} onClick={this.submitForm}>
                      Submit
                    </Button>
                  </div>
                </div>
            }
          </>
        }
        hideCTA
      />
    );
  }
}

export default connectModal({ name: KYC_FORM_MODAL_ID })(
  connect(mapStateToprops, mapDispatchToProps)(translate()(KYCFormModal))
);
