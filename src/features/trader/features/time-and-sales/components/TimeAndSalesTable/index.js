import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import moment from 'moment';

import { Table, Tooltip, Value } from '../../../../../../common/components/trader';

const { DescriptionHeader } = Table;

const getColumns = ({ quoteCurrency, underlying }) => [
  {
    align: 'left',
    dataIndex: 'lastTradeTime',
    render: time => {
      const showDate = !moment()
        .startOf('day')
        .isSame(moment(time).startOf('day'));
      return (
        <Tooltip title={<Value.Date type="datetime" value={time} />}>
          <span className="last-trade-time-wrapper">
            <Value.Date type={showDate ? 'datetimeAbbrev' : 'time'} value={time} />
          </span>
        </Tooltip>
      );
    },
    title: <Trans i18nKey="trader.timeAndSales.columns.time">Time</Trans>,
    width: 100,
  },
  {
    align: 'right',
    dataIndex: 'lastTradePrice',
    render: (price, trade) => (
      <Value.Numeric
        type="price"
        value={price}
        withIcon={!!trade.direction}
        direction={trade.direction}
        autoDecimals
        className={`time-sales-trade-${trade.direction}`}
      />
    ),
    title: (
      <DescriptionHeader currency={quoteCurrency}>
        <Trans i18nKey="trader.timeAndSales.columns.price">Price</Trans>
      </DescriptionHeader>
    ),
    width: 80,
  },
  {
    align: 'right',
    dataIndex: 'lastTradeVolume',
    render: size => <Value.Numeric type="quantity" value={size} />,
    title: (
      <DescriptionHeader currency={underlying}>
        <Trans i18nKey="trader.timeAndSales.columns.size">Size</Trans>
      </DescriptionHeader>
    ),
    width: 110,
  },
];

class TimeAndSalesTable extends Component {
  static propTypes = {
    dataSource: PropTypes.array.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      columns: getColumns({ quoteCurrency: props.quoteCurrency, underlying: props.underlying }),
    };
  }

  componentDidUpdate({ underlying: prevUnderlying }) {
    if (prevUnderlying !== this.props.underlying) {
      this.setState({
        columns: getColumns({
          quoteCurrency: this.props.quoteCurrency,
          underlying: this.props.underlying,
        }),
      });
    }
  }

  render() {
    const { dataSource } = this.props;
    return (
      <Table
        columns={this.state.columns}
        dataSource={dataSource}
        id="timeAndSales"
        pageSize="auto"
        rowKey="lastTradeTime"
      />
    );
  }
}

export default TimeAndSalesTable;
