import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { columns, SummaryTable } from './';

export default class OpenOrdersSummary extends Component {
  static propTypes = {
    order: PropTypes.object.isRequired,
  };

  columns = columns(this.props.order, this.props.quoteCurrency, this.props.priceDecimals);

  render() {
    return <SummaryTable columns={this.columns} dataSource={[this.props.order]} rowKey="orderId" />;
  }
}
