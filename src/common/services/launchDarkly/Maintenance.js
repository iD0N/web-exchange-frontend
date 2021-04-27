import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FeatureFlag } from 'react-launch-darkly';
import Offline from 'react-offline';
import moment from 'moment';

import { SystemBanner, Value } from '../../components/trader';

import { selectIsConnected } from '../spinner';
import apiClient from '../apiClient';

const HEALTHCHECK_INTERVAL = 1000 * 5;
let lastOffline = false;
let countdownTimeout;

const inMaintenanceMode = ({ start, end }) =>
  (!!start &&
    ((moment().isAfter(start) && (!end || moment().isBefore(end))) ||
      !!maintenanceWarning({ start }))) ||
  (!!end &&
    moment()
      .add(1, 'seconds')
      .isBefore(end) &&
    !!maintenanceWarning({ end }));

const maintenanceWarning = ({ start, end }) => {
  if (!start) {
    return undefined;
  }
  const isBeforeStart = moment().isBefore(start);
  const inCountdownToStart = moment()
    .add(15, 'minutes')
    .isAfter(start);

  if (isBeforeStart && !inCountdownToStart) {
    return (
      <>
        Crypto is scheduled to go down for maintenance{' '}
        {moment(start).format('MMMM Do YYYY, h:mm:ss a')}.
      </>
    );
  }

  return isBeforeStart && inCountdownToStart ? (
    <>
      Crypto will go down for maintenance in <Value.Duration reverted verbose value={start} />
    </>
  ) : !!end &&
    moment()
      .add(9.75, 'minutes')
      .isAfter(end) ? (
    <>
      Auctions will begin running again in <Value.Duration reverted verbose value={end} />
    </>
  ) : (
    undefined
  );
};

const mapStateToProps = state => ({
  connected: selectIsConnected(state),
});

class MaintenanceMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      start: this.props.variation.start,
      end: this.props.variation.end,
    };
  }

  componentDidMount() {
    this.setUpdateTimeouts();
  }

  componentDidUpdate({ variation: { start: prevStart, end: prevEnd } }) {
    const {
      variation: { start, end },
    } = this.props;

    this.setUpdateTimeouts();

    if (prevStart !== start || prevEnd !== end) {
      this.setState({ start, end });
    }
  }

  setUpdateTimeouts = () => {
    const {
      variation: { start, end },
      setKey,
    } = this.props;
    const startCountdown = moment(start)
      .add(-15, 'minutes')
      .toISOString();
    const endCountdown = moment(end)
      .add(-9.75, 'minutes')
      .toISOString();

    clearInterval(countdownTimeout);

    let foundTimeout = false;
    [startCountdown, start, endCountdown, end].forEach((time, index) => {
      if (!foundTimeout && moment().isBefore(time)) {
        foundTimeout = true;
        const diff = moment(time).diff(moment());
        countdownTimeout = setTimeout(setKey, diff);
      }
    });
  };

  render() {
    const {
      variation,
      variation: { start, end },
      children,
      connected,
      offline,
      noInfoBanners,
    } = this.props;

    const maintenance = inMaintenanceMode(variation);
    const message = connected ? maintenanceWarning(variation) : undefined;

    const props = {
      ...variation,
      connected,
      hideContents:
        offline ||
        (maintenance && !message) ||
        (!connected && maintenance) ||
        (!!start &&
          moment().isAfter(start) &&
          !!end &&
          moment()
            .add(9.75, 'minutes')
            .isBefore(end)),
      offline,
      maintenance,
      message,
    };
    return (
      <>
        <SystemBanner connectionInfo={props} noInfoBanners={noInfoBanners} />
        {!!children && children(props)}
      </>
    );
  }
}

MaintenanceMessage.defaultProps = {
  variation: {},
};

let lastKey = 0;
let lastCheck = 0;

class Maintenance extends Component {
  state = {
    down: undefined,
    up: undefined,
    key: 0,
  };

  componentDidUpdate({ connected: wasConnected }, { down }) {
    if (wasConnected && !this.props.connected) {
      this.checkHealth();
    }
  }

  checkHealth = () => {
    const { key } = this.state;

    if (this.props.connected || lastKey !== key || Date.now() - lastCheck < HEALTHCHECK_INTERVAL) {
      return;
    }

    lastCheck = Date.now();

    apiClient.get('/time', { apiCallId: null }).then(res => {
      if (!res || !res.status || !res.response || res.status >= 500) {
        setTimeout(this.checkHealth, HEALTHCHECK_INTERVAL);
      }
    });
  };

  render() {
    const { children, connected, noInfoBanners } = this.props;
    return (
      <Offline
        render={({ isOffline: offline }) => {
          if (lastOffline !== offline) {
            lastOffline = offline;
            if (!offline) {
              this.checkHealth();
            }
          }
          return (
            <FeatureFlag
              flagKey="operations-outage-down"
              renderFeatureCallback={variation => (
                <MaintenanceMessage
                  key={this.state.key}
                  setKey={() => {
                    const nextKey = this.state.key + 1;
                    this.setState({ key: nextKey });
                    lastKey = nextKey;
                  }}
                  children={children}
                  connected={connected}
                  noInfoBanners={noInfoBanners}
                  offline={offline}
                  variation={variation}
                />
              )}
              renderDefaultCallback={() => {
                const props = {
                  connected,
                  hideContents: offline,
                  offline,
                  maintenance: true,
                };
                return (
                  <>
                    <SystemBanner connectionInfo={props} noInfoBanners={noInfoBanners} />
                    {!!children && children(props)}
                  </>
                );
              }}
            />
          );
        }}
      />
    );
  }
}

Maintenance.propTypes = {
  childen: PropTypes.node,
  noInfoBanners: PropTypes.bool,
};

export default connect(mapStateToProps)(Maintenance);
