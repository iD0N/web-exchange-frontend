import React from 'react';
import PropTypes from 'prop-types';

import { Dropdown } from '../../../../../../common/components/trader';

import AccountSummaryOverlay from '../AccountSummaryOverlay';
import SummaryBarTrigger from './components/SummaryBarTrigger';
import UnrealizedPl from './components/UnrealizedPl';
import DayPl from './components/DayPl';

const align = { offset: [0, 0] };

const AccountSummary = ({
  accountSummaryData,
  accountSummaryData: { pl, marginBarValues },
  isMobile,
}) =>
  marginBarValues.dataReady &&
  (isMobile ? (
    <AccountSummaryOverlay accountSummaryData={accountSummaryData} isMobile={isMobile} />
  ) : (
    <Dropdown
      align={align}
      fullHeight
      hoverTrigger
      triggerClassName="account-summary-trigger"
      overlay={<AccountSummaryOverlay accountSummaryData={accountSummaryData} />}
    >
      <SummaryBarTrigger {...marginBarValues} />
      <DayPl value={pl.dayPl} />
      <UnrealizedPl value={pl.unrealizedPl} />
    </Dropdown>
  ));

AccountSummary.propTypes = {
  accountSummaryData: PropTypes.object.isRequired,
};

export default AccountSummary;
