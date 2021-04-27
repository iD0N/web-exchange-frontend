import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';

import { Table } from '../../../../../../../../common/components/trader';

import { selectTradableOrderBookLevels } from '../../../../ducks';
import { TOTAL_KEY, HEIGHT } from '../../../../utils/constants';
import SizeColumn from '../../../columns/SizeColumn';
import PriceColumn from '../../../columns/PriceColumn';
import OrderColumn from '../OrderColumn';
import OrderType from '../OrderType';

const { DescriptionHeader } = Table;
const { calcFillWidth } = SizeColumn;

const mapStateToProps = state => ({
  levels: selectTradableOrderBookLevels(state),
});

const columns = (quoteCurrency, underlying) => [
  {
    align: 'right',
    dataIndex: 'mySize',
    render: (mySize, { side, price, sizeByType }) => (
      <OrderColumn levelSide={side} levelPrice={price} sizeByType={sizeByType} />
    ),
    title: (
      <DescriptionHeader>
        <Trans i18nKey="trader.orderBook.columns.myOrders">My Orders</Trans>
        <OrderType />
      </DescriptionHeader>
    ),
    width: 100,
  },
  {
    align: 'right',
    dataIndex: 'price',
    render: price => <PriceColumn price={price} />,
    title: (
      <DescriptionHeader currency={quoteCurrency}>
        <Trans i18nKey="trader.orderBook.columns.price">Price</Trans>
      </DescriptionHeader>
    ),
    width: 80,
  },
  {
    align: 'right',
    dataIndex: 'size',
    render: size => <SizeColumn decimalsOverride={4} size={size} />,
    title: (
      <DescriptionHeader currency={underlying}>
        <Trans i18nKey="trader.orderBook.columns.size">Size</Trans>
      </DescriptionHeader>
    ),
    width: 80,
  },
  {
    align: 'right',
    dataIndex: 'total',
    title: (
      <DescriptionHeader currency={underlying}>
        <Trans i18nKey="trader.orderBook.columns.total">Total</Trans>
      </DescriptionHeader>
    ),
    render: (total, order) => (
      <SizeColumn
        decimalsOverride={4}
        size={total}
        fillClassName={`bg-${order.side}`}
        fillWidth={calcFillWidth(TOTAL_KEY)(total, order)}
      />
    ),
    width: 100,
  },
];

class TradableDOMTable extends Component {
  static propTypes = {
    levels: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      columns: columns(props.quoteCurrency, props.underlying),
    };
  }

  componentWillReceiveProps({ quoteCurrency: nextQuoteCurrency, underlying: nextUnderlying }) {
    const { quoteCurrency, underlying } = this.props;

    if (underlying !== nextUnderlying || quoteCurrency !== nextQuoteCurrency) {
      this.setState({ columns: columns(quoteCurrency, nextUnderlying) });
    }
  }

  render() {
    return (
      <Table
        className="order-book-table-tradable"
        columns={this.state.columns}
        dataSource={this.props.levels}
        id="orderBook"
        rowHeight={HEIGHT.ROW}
        rowKey="rowKey"
      />
    );
  }
}

export default connect(mapStateToProps)(TradableDOMTable);
