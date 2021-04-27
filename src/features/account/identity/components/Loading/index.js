import React from 'react';
import { Trans } from 'react-i18next';

import { Widget, Spin } from '../../../../../common/components';

const Loading = () => (
  <Widget
    className="identity-verification-loading"
    title={<Trans i18nKey="kycLoading.title">Please wait...</Trans>}
  >
    <Spin />
  </Widget>
);

export default Loading;
