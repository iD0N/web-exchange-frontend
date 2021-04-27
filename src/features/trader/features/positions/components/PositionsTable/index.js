import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { show } from 'redux-modal';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';

import { logEventAction } from '../../../../../../common/services/eventLogger';
import {
  EVENT_ACTIONS,
  EVENT_TYPES,
} from '../../../../../../common/services/eventLogger/constants';
import { Table } from '../../../../../../common/components/trader';
import { IsMobile } from '../../../../../../common/components';
import { openGlobalContractAction } from '../../../../data-store/ducks';
import { closePositionAction } from '../../../trade-mode/ducks'; // TODO uplift
import generateConfirmClosePositionModal from '../../../trade-mode/components/ToolBar/ConfirmClosePositionModal'; // TODO uplift

import columns from './columns';
import { selectPositionsTableRows } from './ducks';

export const CLOSE_POSITION_MODAL_ID = 'positions/close-position-modal';
const ConfirmClosePositionModal = generateConfirmClosePositionModal(CLOSE_POSITION_MODAL_ID);

const { SORT_ORDERS } = Table;

const mapStateToProps = state => ({
  positionsList: selectPositionsTableRows(state),
});

const mapDispatchToProps = {
  closePosition: closePositionAction,
  logEvent: logEventAction,
  showClosePositionModal: () => show(CLOSE_POSITION_MODAL_ID),
  openGlobalContract: openGlobalContractAction,
};

class PositionsTable extends Component {
  static propTypes = {
    config: PropTypes.object,
    positionsList: PropTypes.array.isRequired,
    openGlobalContract: PropTypes.func.isRequired,
    showClosePositionModal: PropTypes.func.isRequired,
    closePosition: PropTypes.func.isRequired,
    onConfigChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      positionToClose: {},
    };
    this.columns = columns({
      onClosePositionClick: this.onClosePositionClick,
    });
  }

  onClosePositionClick = (positionToClose, bypassConfirmation) => {
    const disableConfirmation = !!this.props.hideConfirmations;
    if (disableConfirmation || bypassConfirmation) {
      this.logClosePosition(positionToClose, true);
      this.props.closePosition({ contractCode: positionToClose.contractCode });
      return;
    }
    this.logClosePosition(positionToClose);
    this.setState({ positionToClose }, this.props.showClosePositionModal);
  };

  onRow = ({ contractCode }) => ({
    onClick: () => this.props.openGlobalContract(contractCode),
  });

  logClosePosition = (position, confirm) =>
    this.props.logEvent({
      action: confirm
        ? EVENT_ACTIONS.CLOSE_POSITION_CONFIRM
        : EVENT_ACTIONS.CLOSE_POSITION_INITIATE,
      isMobile: this.props.isMobile,
      position,
      type: EVENT_TYPES.CLICK,
      widget: 'positions',
    });

  render() {
    const { config, positionsList, onConfigChange } = this.props;
    const {
      positionToClose: { contractCode, hasPosition },
    } = this.state;

    return (
      <>
        {hasPosition && (
          <ConfirmClosePositionModal
            contractCode={contractCode}
            closePosition={position => this.onClosePositionClick(position, true)}
          />
        )}
        <Table
          className="positions"
          config={config}
          columns={this.columns}
          dataSource={positionsList}
          defaultSortKey="contractCode"
          defaultSortOrder={SORT_ORDERS.ASC}
          emptyText={<Trans i18nKey="trader.positions.noPositions">No Positions</Trans>}
          enableColumnManagement
          enableColumnOrdering
          enableResize
          enableSort
          id="positions"
          pageSize="auto"
          rowKey="contractCode"
          onConfigChange={onConfigChange}
          onRow={this.onRow}
        />
      </>
    );
  }
}

export default IsMobile(connect(mapStateToProps, mapDispatchToProps)(PositionsTable));
