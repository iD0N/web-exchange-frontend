import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Trans, translate } from 'react-i18next';
import QRCode from 'qrcode.react';

import { Col, Row, Form, Spin } from '../../../../../../common/components';
import { CopyIconButton, Input } from '../../../../../../common/components/trader';

const Deposit = ({ address, isMobile, t, token }) => (
  <Col span={isMobile ? 24 : 12}>
    <Row>
      <Col span={24}>
        <h2>
          <Trans i18nKey="settings.transfers.deposit.title">Deposit</Trans>
        </h2>
      </Col>
    </Row>
    <Row>
      <Col span={24}>
        <Spin spinning={!address}>
          <div className="deposit-funds-wrapper">
            <div className="deposit-address-wrapper">
              <div className="qr-code-wrapper">
                {!!address && <QRCode size={112} value={address} />}
              </div>
              <div className="deposit-address-input-wrapper">
                <Form.Item
                  colon={false}
                  className="deposit-address-input"
                  label={t('settings.transfers.deposit.address', {
                    token,
                    defaultValue: `${token} Deposit Address`,
                  })}
                >
                  <Input value={address} spellCheck={false} onClick={e => e.target.select()} />
                  {!!address && !isMobile && <CopyIconButton content={address} forInput />}
                </Form.Item>
              </div>
            </div>
          </div>
        </Spin>
      </Col>
    </Row>
  </Col>
);

Deposit.propTypes = {
  address: PropTypes.string,
  isMobile: PropTypes.bool,
  token: PropTypes.string.isRequired,
};

export default memo(translate()(Deposit));
