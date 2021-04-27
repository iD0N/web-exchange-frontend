import React from 'react';
import PropTypes from 'prop-types';
import { Cookies, withCookies } from 'react-cookie';
import Input from 'antd/lib/input';

import { cookieDomainOption } from '../../../config';

import FormItem from '../Form/FormItem';

const ReferralCodeInput = ({ cookies }) => (
  <FormItem
    id="referralCode"
    style={{ display: 'none' }}
    initialValue={cookies.get('referralCode', cookieDomainOption())}
  >
    <Input hidden />
  </FormItem>
);

ReferralCodeInput.propTypes = {
  cookies: PropTypes.instanceOf(Cookies).isRequired,
};

export default withCookies(ReferralCodeInput);
