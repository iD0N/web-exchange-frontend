import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';

import {
  Col,
  Row,
  Icon,
  Form,
  FormItem,
  FormScreen,
  Spin,
} from '../../../../../../../common/components';
import { Button, Input, InputNumber } from '../../../../../../../common/components/trader';
import rules from '../../../../../../../common/rules';

import SetMax from './SetMax';

class WithdrawalForm extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    maxValue: PropTypes.number,
    onSubmit: PropTypes.func.isRequired,
    withdrawalFee: PropTypes.string,
  };

  componentDidUpdate({ isSubmitting: wasSubmitting }) {
    if (wasSubmitting && !this.props.isSubmitting) {
      this.props.form.resetFields();
      this.props.form.validateFields();
    }
  }

  render() {
    const { form, isSubmitting, onSubmit, maxValue, t, token, withdrawalFee } = this.props;

    return (
      <FormScreen form={form} onSubmit={onSubmit}>
        {({ hasErrors, handleSubmit }) => (
          <Form className="withdrawal-form" layout="horizontal" onSubmit={handleSubmit}>
            <Row>
              <Col span={24}>
                <Spin spinning={isSubmitting}>
                  <FormItem
                    id="destinationAddress"
                    colon={false}
                    label={<Trans i18nKey="settings.transfers.withdrawals.sendTo">Send To</Trans>}
                    type="number"
                    rules={[rules.required]}
                  >
                    <Input
                      placeholder={t('settings.transfers.withdrawals.address', {
                        token,
                        defaultValue: `${token} Withdrawal Address`,
                      })}
                      spellCheck={false}
                    />
                  </FormItem>
                  <FormItem
                    id="amount"
                    className="set-max-input-control"
                    colon={false}
                    label={
                      <>
                        <Trans i18nKey="settings.transfers.withdrawals.amount">Amount</Trans>
                        <SetMax
                          onClick={() => form.setFieldsValue({ amount: maxValue })}
                          max={maxValue}
                        />
                      </>
                    }
                    rules={[
                      rules.positiveNumber,
                      rules.number,
                      rules.required,
                      rules.maxValue(maxValue),
                    ]}
                  >
                    <InputNumber placeholder={'Amount'} step={1} />
                  </FormItem>
                  <div className="withrawal-fee-wrapper">
                    { t('settings.transfers.withdrawals.withdrawalFee', {
                      withdrawalFee,
                      token,
                      defaultValue: `There is a ${withdrawalFee} ${token} fee for this withdrawal.  You will receive your requested withdrawal amount less ${withdrawalFee} once confirmed.`,
                    }) }
                  </div>
                  <div className="disclaimer-wrapper">
                    <Icon type="info-circle" />
                    <Trans i18nKey="settings.transfers.withdrawals.disclaimer" />
                  </div>
                  <div className="form-footer">
                    <Button
                      block
                      disabled={hasErrors}
                      htmlType="submit"
                      loading={isSubmitting}
                      size="medium"
                      type="ghost"
                    >
                      {isSubmitting ? (
                        <Trans i18nKey="settings.transfers.withdrawals.requestingWithdrawal">
                          Requesting Withdrawal
                        </Trans>
                      ) : (
                        t('settings.transfers.withdrawals.withdrawFunds', {
                          token,
                          defaultValue: `Withdraw Funds (${token})`,
                        })
                      )}
                    </Button>
                  </div>
                </Spin>
              </Col>
            </Row>
          </Form>
        )}
      </FormScreen>
    );
  }
}

export default Form.create()(translate()(WithdrawalForm));
