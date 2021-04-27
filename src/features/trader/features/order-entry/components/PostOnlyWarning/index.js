import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Trans } from 'react-i18next';

import { Icon } from '../../../../../../common/components';
import { Tooltip, Value } from '../../../../../../common/components/trader';

import {
  selectContractOutage,
  selectIsInOutage,
  selectIsInEntryOnlyMode,
  storeContractOutageAction,
} from '../../../../data-store/ducks';

let countdownTimeout = setTimeout(() => {}, 0);

const mapStateToProps = state => ({
  outageMap: selectContractOutage(state),
  isInOutage: selectIsInOutage(state),
  isInEntryOnlyMode: selectIsInEntryOnlyMode(state),
});

const mapDispatchToProps = {
  storeContractOutage: storeContractOutageAction,
};

class PostOnlyWarning extends Component {
  componentDidMount() {
    if (!!this.props.isInEntryOnlyMode) {
      this.setCountdownTimeout();
    } else {
      this.props.storeContractOutage({ contract: '_key_', outage: { start: Date.now() } });
    }
  }

  componentDidUpdate({ isInEntryOnlyMode: prevEntryOnlyMode }) {
    const { isInEntryOnlyMode } = this.props;
    if (!prevEntryOnlyMode !== isInEntryOnlyMode) {
      this.setCountdownTimeout();
    }
  }

  componentWillUnmount() {
    clearTimeout(countdownTimeout);
  }

  setCountdownTimeout() {
    const { isInEntryOnlyMode: end, storeContractOutage } = this.props;

    clearTimeout(countdownTimeout);
    if (end && moment().isBefore(end)) {
      const delta = moment(end).diff(moment());
      countdownTimeout = setTimeout(() => {
        storeContractOutage({ contract: '_key_', outage: { start: Date.now() } });
      }, delta);
      // updating the data-store arbitrarily to force re-render
    }
  }

  render() {
    const { isInOutage, isInEntryOnlyMode } = this.props;
    return (
      isInOutage &&
      !!isInEntryOnlyMode &&
      Math.abs(moment().diff(isInEntryOnlyMode)) > 100 && (
        <span className="order-entry-title-order-only">
          <Tooltip
            className="entry-only-tooltip"
            title={
              <>
                <Trans i18nKey="widget.postOnly" />{' '}
                <Value.Duration reverted verbose value={isInEntryOnlyMode} />.
              </>
            }
          >
            <Icon type="warning" />
          </Tooltip>
        </span>
      )
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PostOnlyWarning);
