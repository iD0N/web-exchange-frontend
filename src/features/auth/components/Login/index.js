import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans, translate } from 'react-i18next';
import { Link } from 'react-router-dom';
import Radio from 'antd/lib/radio';
import 'antd/lib/radio/style/index.css';

import { isProd } from '../../../../config';
import IPFilterModal from '../IPFilterModal';

import {
  Alert,
  Button,
  Form,
  FormScreen,
  FormItem,
  Input,
  Widget,
  PasswordInput,
  // Row,
  // Col,
  // Divider,
} from '../../../../common/components';
import rules from '../../../../common/rules';
import i18n, { CHINESE } from '../../../../common/services/i18n';

import MobileNumberInput from '../MobileNumberInput';

// import SocialButton from '../SocialButton';

class LoginForm extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
  };

  emailRef = React.createRef();
  mobileRef = React.createRef();
  passwordRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      isMobileNumber: i18n.language === CHINESE,
    };
  };

  componentDidMount() {
    const watchInputsInterval = setInterval(() => {
      const getInputValue = ref => ref.current && ref.current.input && ref.current.input.value;

      const email = getInputValue(this.emailRef);
      const mobile = getInputValue(this.mobileRef);
      const password = getInputValue(this.passwordRef);

      if (email && password) {
        this.props.form.setFieldsValue({ email, password });
        clearInterval(watchInputsInterval);
      } else if (mobile && password) {
        this.props.form.setFieldsValue({ mobile, password });
        clearInterval(watchInputsInterval); 
      }
    }, 250);
  }

  render() {
    const { form, t, isLoading, onSubmit } = this.props;
    const { isMobileNumber } = this.state;

    return (
      <Widget title={<Trans i18nKey="logIn.title">Log In</Trans>}>
        <div style={{ marginBottom: 15, marginTop: -15 }}>
          {isProd() && (
            <Alert
              message={
                <Trans i18nKey="logIn.countryDisclaimer">
                  In accordance with our Terms and Conditions, persons that are located in or a
                  resident of the
                  <strong>
                    {' '}
                    United States of America or any other jurisdiction where the services offered by
                    Crypto are restricted{' '}
                  </strong>
                  are prohibited from holding positions or trading on Crypto.
                </Trans>
              }
              type="warning"
            />
          )}
        </div>
        <div className="sign-up-page">
          <Radio.Group
            value={isMobileNumber ? "mobile" : "email"}
            onChange={({ target: { value } }) => this.setState({ isMobileNumber: value === "mobile" })}>
            <Radio.Button value="email">{<Trans i18nKey="fields.email.label">E-mail</Trans>}</Radio.Button>
            <Radio.Button value="mobile">{<Trans i18nKey="fields.mobile.label">Mobile</Trans>}</Radio.Button>
          </Radio.Group>
        </div>
        <FormScreen key={isMobileNumber ? "mobile" : "email"} form={form} onSubmit={onSubmit}>
          {({ hasErrors, handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              {isMobileNumber
                ? <MobileNumberInput />
                : <FormItem
                    id="email"
                    rules={[rules.required, ...rules.email]}
                    label={<Trans i18nKey="fields.email.label">E-mail</Trans>}
                  >
                    <Input
                      ref={this.emailRef}
                      type="email"
                      placeholder={t('logIn.email.placeholder', { defaultValue: 'E-mail' })}
                      autoFocus
                    />
                  </FormItem>
              }
              <FormItem
                id="password"
                rules={[rules.required, rules.password]}
                label={<Trans i18nKey="fields.password.label">Password</Trans>}
              >
                <PasswordInput
                  inputRef={this.passwordRef}
                  placeholder={t('logIn.password.placeholder', {
                    defaultValue: 'Enter Password',
                  })}
                />
              </FormItem>
              <Form.Item>
                <Link to="/auth/forgotten-password">
                  <Trans i18nKey="logIn.forgotPassword">Forgot password?</Trans>
                </Link>
              </Form.Item>
              <Button
                loading={isLoading}
                disabled={hasErrors}
                block
                type="primary"
                htmlType="submit"
              >
                <Trans i18nKey="logIn.logIn">Log In</Trans>
              </Button>
            </Form>
          )}
        </FormScreen>
        <IPFilterModal />
      </Widget>
    );
  }
}

export default translate()(Form.create()(LoginForm));
