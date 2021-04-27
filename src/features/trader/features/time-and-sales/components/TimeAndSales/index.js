import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { Spin } from '../../../../../../common/components';
import { Empty } from '../../../../../../common/components/trader';
import { GridLayoutTile, WidgetHeader } from '../../../../components';

import TimeAndSalesTable from '../TimeAndSalesTable';
import MinimumVolumeSelect from '../MinimumVolumeSelect';

const TimeAndSales = ({
  timeAndSales,
  minTradeSize,
  updateMinTradeSize,
  isLoading,
  quoteCurrency,
  underlying,
}) => (
  <Spin spinning={isLoading}>
    <GridLayoutTile
      title={
        <WidgetHeader title={<Trans i18nKey="trader.timeAndSales.title">Recent Trades</Trans>} />
      }
      controls={<MinimumVolumeSelect value={minTradeSize} onChange={updateMinTradeSize} />}
      content={
        timeAndSales.length === 0 ? (
          <Empty />
        ) : (
          <TimeAndSalesTable
            dataSource={timeAndSales}
            quoteCurrency={quoteCurrency}
            underlying={underlying}
          />
        )
      }
    />
  </Spin>
);

TimeAndSales.propTypes = {
  timeAndSales: PropTypes.array.isRequired,
  minTradeSize: PropTypes.number.isRequired,
  updateMinTradeSize: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  underlying: PropTypes.string,
};

export default TimeAndSales;
