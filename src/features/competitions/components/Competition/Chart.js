import React, { memo } from 'react';
import PropTypes from 'prop-types';
import ReactChartkick, { LineChart } from 'react-chartkick';
import Highcharts from 'highcharts';

import highchartsConfig from './highchartsConfig';

Highcharts.setOptions({
  lang: {
    resetZoom: 'Show Full History',
  },
});
ReactChartkick.addAdapter(Highcharts);

const colors = [
  '#7ccefb',
  '#89f970',
  '#c678dd',
  '#fc5875',
  '#ffb265',
  '#0c8fec',
  '#f2f25c',
  '#18f1d1',
  '#8e3039',
];

const CompetitionChart = ({ chartData: data, hideIneligible, eligibleAnonymousNames }) => {
  const chartData = hideIneligible
    ? data.filter(({ anonymous_name }) => eligibleAnonymousNames[anonymous_name])
    : data;

  return (
    chartData &&
    chartData.length > 0 &&
    Object.keys(chartData[0].data).length > 1 && (
      <div className="chart-container">
        <LineChart data={chartData} colors={colors} suffix="%" library={highchartsConfig} />
      </div>
    )
  );
};

CompetitionChart.propTypes = {
  chartData: PropTypes.array.isRequired,
};

export default memo(CompetitionChart);
