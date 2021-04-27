import React, { Component } from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { FeatureFlag } from 'react-launch-darkly';
import moment from 'moment';

import { TimeUtils } from '@acdxio/common';

import { storeContractOutageAction } from '../../../data-store/ducks';

import { Empty, Value } from '../../../../../common/components/trader';

const MINUTES_UNTIL_RETURN = 10;

const OUTAGE_TYPE = {
  CLOSED: 'closed',
  MAINTENANCE: 'maintenance',
};

let countdownTimeout = setTimeout(() => {}, 0);
const mapDispatchToProps = {
  storeContractOutage: storeContractOutageAction,
};

class Placeholder extends Component {
  componentDidMount() {
    const { start, end, contract, storeContractOutage } = this.props;

    this.setCountdownTimeout();
    storeContractOutage({ contract, outage: { start, end } });
  }

  componentDidUpdate({ end: prevEnd, start: prevStart }) {
    const { start, end, contract, storeContractOutage } = this.props;

    if (prevEnd !== end || prevStart !== start) {
      this.setCountdownTimeout();
    }

    if (prevStart !== start || prevEnd !== end) {
      storeContractOutage({ contract, outage: { start, end } });
    }
  }

  componentWillUnmount() {
    clearTimeout(countdownTimeout);
  }

  setCountdownTimeout() {
    const { start, end, setKey } = this.props;
    clearTimeout(countdownTimeout);
    if (start && moment().isBefore(start)) {
      const delta = moment(start).diff(moment());
      countdownTimeout = setTimeout(setKey, delta);
    } else if (end && moment().isBefore(end)) {
      let delta = moment(end)
        .add(0 - MINUTES_UNTIL_RETURN, 'minutes')
        .diff(moment());
      if (delta < 0) {
        delta = moment(end).diff(moment());
      }
      countdownTimeout = setTimeout(setKey, delta);
    }
  }

  render() {
    const { content, contract, end, start, t, type } = this.props;

    if (
      (start && moment().isBefore(start)) ||
      (end &&
        moment()
          .add(MINUTES_UNTIL_RETURN, 'minutes')
          .isAfter(end))
    ) {
      return content;
    }

    return (
      <Empty
        className="contract-outage-placeholder"
        description={
          !!end && moment().isBefore(end) ? (
            <>
              {type && type === OUTAGE_TYPE.CLOSED
                ? t('widget.scheduledClose')
                : t('widget.outageWithReturnTime', {
                    contract,
                    defaultValue: `Maintenance is currently being performed on this contract. Trading for ${contract}} is scheduled to resume in: `,
                  })}
              <Value.Duration reverted verbose value={end} />. {t('widget.outageReturns')}
            </>
          ) : (
            t('widget.outage', { defaultValue: 'You must be logged in to use this widget.' })
          )
        }
      />
    );
  }
}

const ConnectedPlaceholder = connect(undefined, mapDispatchToProps)(Placeholder);

const ContractOutagePlaceholder = ({ children, contract, setKey, t }) =>
  contract ? (
    <FeatureFlag
      flagKey="operations-market-closed"
      renderFeatureCallback={outages => {
        if (!outages || !contract || !outages[contract]) {
          return children;
        }

        const { type } = outages[contract];
        const { start, end } = TimeUtils.processRecurrence(outages[contract]);
        if (!start || (end && moment().isAfter(end))) {
          return children;
        }

        return (
          <ConnectedPlaceholder
            content={children}
            contract={contract}
            type={type}
            start={start.toISOString()}
            end={end.toISOString()}
            t={t}
            setKey={setKey}
          />
        );
      }}
    />
  ) : (
    children
  );

export default translate()(ContractOutagePlaceholder);
