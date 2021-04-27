import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';
import { show } from 'redux-modal';

import { Table } from '../../../../../../common/components/trader';
import { IsMobile } from '../../../../../../common/components';
import { setTokenAction } from '../../../../../settings/components/transfers/ducks';
import { NEGATIVE_USD_CONVERT_MODAL } from '../../../../components/NegativeUsdConvertModal';

import columns from './columns';
import { selectBalancesTable } from './ducks';

const { SORT_ORDERS } = Table;

const mapStateToProps = state => ({
  balancesList: selectBalancesTable(state),
});

const mapDispatchToProps = {
  setTransferToken: setTokenAction,
  showConvertModal: () => show(NEGATIVE_USD_CONVERT_MODAL)
};

class PositionsTable extends Component {
  static propTypes = {
    balancesList: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);
    this.columns = columns({
      setTransferToken: props.setTransferToken,
      showConvertModal: props.showConvertModal,
      isRebalancingUsd: props.isRebalancingUsd,
     });
  }

  render() {
    const { balancesList, highlightedTokenCodes } = this.props;

    return (
      <Table
        className="balances"
        columns={this.columns}
        dataSource={balancesList}
        defaultSortKey="tokenCode"
        defaultSortOrder={SORT_ORDERS.ASC}
        emptyText={<Trans i18nKey="trader.positions.balances.noBalances">No Balances</Trans>}
        enableColumnOrdering
        enableResize
        enableSort
        id="balances"
        pageSize="auto"
        rowKey="tokenCode"
        rowClassName={({ tokenCode }) =>
          highlightedTokenCodes && highlightedTokenCodes.includes(tokenCode)
            ? 'balances-row-active'
            : ''
        }
      />
    );
  }
}

export default IsMobile(connect(mapStateToProps, mapDispatchToProps)(PositionsTable));
