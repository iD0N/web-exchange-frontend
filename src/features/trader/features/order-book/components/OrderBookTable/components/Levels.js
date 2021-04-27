import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import cn from 'classnames';
import BigNumber from 'bignumber.js';

import { Table } from '../../../../../../../common/components/trader';
import { OrderEntryConsumer } from '../../../../order-entry/OrderEntryContext'; // TODO uplift
import { SIZE_TYPE } from '../../../../order-entry/constants';

import { TOTAL_KEY, TOTAL_KEY_NOTIONAL, HEIGHT, LEVEL_SIDES } from '../../../utils/constants';
import SizeColumn from '../../columns/SizeColumn';
import PriceColumn from '../../columns/PriceColumn';

const { DescriptionHeader } = Table;
const { calcFillWidth } = SizeColumn;

const columns = (sizeType, underlying, quoteCurrency) => [
  {
    align: 'right',
    dataIndex: 'price',
    render: price => <PriceColumn price={price} />,
    title: (
      <DescriptionHeader currency={quoteCurrency}>
        <Trans i18nKey="trader.orderBook.columns.price">Price</Trans>
      </DescriptionHeader>
    ),
    width: 90,
  },
  sizeType === SIZE_TYPE.QUANTITY
    ? {
        align: 'right',
        dataIndex: 'size',
        render: (size, { mySize }) => <SizeColumn decimalsOverride={4} size={size} mySize={mySize} />,
        title: (
          <DescriptionHeader currency={underlying}>
            <Trans i18nKey="trader.orderBook.columns.size">Size</Trans>
          </DescriptionHeader>
        ),
        width: 90,
      }
    : {
        align: 'right',
        dataIndex: 'size',
        render: (size, { mySize, price }) => (
          <SizeColumn
            decimalsOverride={4}
            size={BigNumber(size)
              .multipliedBy(price)
              .toNumber()}
            mySize={BigNumber(mySize)
              .multipliedBy(price)
              .toNumber()}
          />
        ),
        title: (
          <DescriptionHeader currency={quoteCurrency}>
            <Trans i18nKey="trader.orderBook.columns.size">Size</Trans>
          </DescriptionHeader>
        ),
        width: 90,
      },
  {
    align: 'right',
    dataIndex: 'total',
    render: (total, level) => (
      <SizeColumn
        decimalsOverride={sizeType === SIZE_TYPE.QUANTITY ? 4 : 4}
        size={sizeType === SIZE_TYPE.QUANTITY ? level.total : level.totalNotional}
        fillClassName={`bg-${level.side}`}
        fillWidth={calcFillWidth(sizeType === SIZE_TYPE.QUANTITY ? TOTAL_KEY : TOTAL_KEY_NOTIONAL)(
          sizeType === SIZE_TYPE.QUANTITY ? level.total : level.totalNotional,
          level,
          sizeType
        )}
      />
    ),
    title:
      sizeType === SIZE_TYPE.QUANTITY ? (
        <DescriptionHeader currency={underlying}>
          <Trans i18nKey="trader.orderBook.columns.total">Total</Trans>
        </DescriptionHeader>
      ) : (
        <DescriptionHeader currency={quoteCurrency}>
          <Trans i18nKey="trader.orderBook.columns.totalQty">Total</Trans>
        </DescriptionHeader>
      ),
    width: 100,
  },
];

export default class Levels extends Component {
  static propTypes = {
    dataSource: PropTypes.array.isRequired,
    levelSide: PropTypes.string.isRequired,
    quoteCurrency: PropTypes.string.isRequired,
    showHeader: PropTypes.bool,
    sizeType: PropTypes.string.isRequired,
    underlying: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      columns: columns(props.sizeType, props.underlying, props.quoteCurrency),
    };
  }

  componentWillReceiveProps({
    sizeType: nextSizeType,
    underlying: nextUnderlying,
    quoteCurrency: nextQuoteCurrency,
  }) {
    const { sizeType, underlying, quoteCurrency } = this.props;

    if (
      sizeType !== nextSizeType ||
      underlying !== nextUnderlying ||
      quoteCurrency !== nextQuoteCurrency
    ) {
      this.setState({ columns: columns(nextSizeType, nextUnderlying, nextQuoteCurrency) });
    }
  }

  render() {
    const { dataSource, levelSide, showHeader } = this.props;

    return (
      <OrderEntryConsumer>
        {({ setLimitOrder }) => (
          <Table
            className={cn('order-book-table', {
              'is-empty': dataSource.length === 0,
            })}
            columns={this.state.columns}
            dataSource={dataSource}
            emptyText={
              levelSide === LEVEL_SIDES.ASK ? (
                <Trans i18nKey="trader.orderBook.noAsks">No asks</Trans>
              ) : (
                <Trans i18nKey="trader.orderBook.noBids">No bids</Trans>
              )
            }
            id={`orderBook_${levelSide}`}
            onRow={level => ({
              onClick: () => setLimitOrder(level.price, levelSide),
            })}
            rowHeight={HEIGHT.ROW}
            rowKey="price"
            showHeader={!!showHeader}
          />
        )}
      </OrderEntryConsumer>
    );
  }
}
