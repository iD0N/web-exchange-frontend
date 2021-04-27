import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans, translate } from 'react-i18next';

import {
  ButtonLink,
  Form,
  FormScreen,
//  FormItem,
  Input,
  Row,
  Col,
} from '../../../../../../common/components';
import { Value } from '../../../../../../common/components/trader';
import { refreshProfileAction } from '../../../../../../common/services/user';

const mapDispatchToProps = {
  refreshProfile: refreshProfileAction,
};

class Profile extends Component {
  static propTypes = {
    userAttributes: PropTypes.object.isRequired,
    isSocialUser: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool,
    t: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.props.refreshProfile();
  }

  componentDidUpdate({ isSaving: wasSaving }) {
    const { form, isSaving } = this.props;

    if (wasSaving && !isSaving) {
      form.resetFields();
    }
  }

  render() {
    const { form, userAttributes, isSocialUser, onSubmit, t } = this.props;

    return (
      <FormScreen form={form} onSubmit={onSubmit}>
        {({ hasErrors, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            {/*<Row>
              <Col sm={12}>
                <FormItem
                  id="given_name"
                  initialValue={userAttributes.given_name}
                  label={<Trans i18nKey="settings.account.fields.firstName">First Name</Trans>}
                >
                  <Input
                    disabled={isSocialUser || isSaving}
                    placeholder={t('settings.account.fields.firstName', {
                      defaultValue: 'First Name',
                    })}
                  />
                </FormItem>
              </Col>
              <Col sm={12}>
                <FormItem
                  id="family_name"
                  initialValue={userAttributes.family_name}
                  label={<Trans i18nKey="settings.account.fields.lastName">Last Name</Trans>}
                >
                  <Input
                    disabled={isSocialUser || isSaving}
                    placeholder={t('settings.account.fields.lastName', {
                      defaultValue: 'Last Name',
                    })}
                  />
                </FormItem>
              </Col>
            </Row>*/}
            <Row>
              {!!userAttributes.email && <Col sm={isSocialUser ? 24 : 12}>
                <Form.Item
                  id="email"
                  floating
                  label={<Trans i18nKey="settings.account.fields.email">Email Address</Trans>}
                >
                  <Input
                    id="email"
                    disabled
                    defaultValue={userAttributes.email}
                    placeholder={t('settings.account.fields.email', {
                      defaultValue: 'Email Address',
                    })}
                    type="email"
                    // suffix={
                    //   !isSocialUser ? (
                    //     <ButtonLink link to="/settings/account/email">
                    //       <Trans i18nKey="email.change">Change</Trans>
                    //     </ButtonLink>
                    //   ) : (
                    //     undefined
                    //   )
                    // }
                  />
                </Form.Item>
                {isSocialUser && (
                  <div className="email-sso-disclaimer">
                    <Value.Text>
                      <Trans i18nKey="settings.account.fields.ssoEmail">
                        Your email address is managed through your single sign-on (SSO) provider
                        settings.
                      </Trans>
                    </Value.Text>
                  </div>
                )}
              </Col>}
              {!isSocialUser && (
                <Col sm={12}>
                  <Form.Item
                    id="password"
                    floating
                    label={<Trans i18nKey="settings.account.fields.password">Password</Trans>}
                  >
                    <Input
                      id="password"
                      disabled
                      defaultValue="***********"
                      suffix={
                        <ButtonLink link to="/settings/account/password">
                          <Trans i18nKey="password.change">Change</Trans>
                        </ButtonLink>
                      }
                    />
                  </Form.Item>
                </Col>
              )}
            </Row>
            {/*<Button disabled={hasErrors} block size="medium" type="ghost" htmlType="submit">
              {isSaving ? (
                <Trans i18nKey="profile.saving">Saving</Trans>
              ) : (
                <Trans i18nKey="profile.save">Save</Trans>
              )}
            </Button>*/}
          </Form>
        )}
      </FormScreen>
    );
  }
}

export default Form.create()(connect(undefined, mapDispatchToProps)(translate()(Profile)));
