import React from 'react';
import { Trans, translate } from 'react-i18next';
import Select from 'antd/lib/select';
import 'antd/lib/select/style/index.css';

import {
  FormItem,
  Input,
} from '../../../../common/components';
import rules from '../../../../common/rules';
import i18n, { CHINESE } from '../../../../common/services/i18n';

const { Option } = Select;

const prefixSelector = () => (
  <FormItem id="mobilePrefix" name="prefix" initialValue={i18n.language === CHINESE ? "86" : "82"}>
    <Select style={{ width: 70 }}>
      <Option value="86">+86</Option>
      <Option value="82">+82</Option>
    </Select>
  </FormItem>
);

const MobileNumberInput = ({ t }) => (
  <span className="mobile-number-input">
    <FormItem
      id="mobile"
      rules={[rules.required, rules.mobileNumber]}
      label={<Trans i18nKey="signUp.mobile.label">Mobile Number</Trans>}
    >
      <Input
        addonBefore={prefixSelector()}
        placeholder={t('signUp.mobile.placeholder', { defaultValue: 'Mobile number' })}
        type="tel"
        autoFocus
      />
    </FormItem>
  </span>
);

export default translate()(MobileNumberInput);
