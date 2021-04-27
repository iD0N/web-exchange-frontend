import React from 'react';
import { connect } from 'react-redux';
import ReactChartkick, { LineChart } from 'react-chartkick';
import Highcharts from 'highcharts';

import { selectTimeSeriesFactory } from '../ducks';

ReactChartkick.addAdapter(Highcharts);

const config = (min, max) => ({
  chart: {
    animation: false,
    margin: [0, 0, 0, 0],
    height: 40,
    plotHeight: 40,
    plotAreaHeight: 40,
    plotTop: 0,
    plotLeft: 0,
    plotRight: 0,
    plotBottom: 0,
    spacing: [0, 0, 0, 0],
  },
  legend: {
    enabled: false,
  },
  xAxis: {
    visible: false,
    allowDecimals: false,
    minPadding: 0,
    maxPadding: 0,
    tickmarkPlacement: 'on',
  },
  yAxis: {
    visible: false,
    endOnTick: false,
    maxPadding: 0,
    min,
    max,
  },
  tooltip: {
    enabled: false,
  },
  plotOptions: {
    series: {
      clip: false,
      connectEnds: true,
      animation: false,
      getExtremesFromAll: true,
      pointPlacement: 'on',
      lineWidth: 2,
      marker: {
        enabled: false,
        radius: 0,
        height: 0,
        width: 0,
      },
      states: {
        hover: {
          enabled: false,
        },
      },
    },
  },
});

const colors = [
  '#6bedac',
  '#d9472e',
  '#c162de',
  '#f29e55',
  '#144654',
  '#e0ce41',
  '#3dba9f',
  '#a12708',
];

const makeMapStateToProps = () => {
  // get instance of selector private to this component instance
  const selectTimeSeries = selectTimeSeriesFactory();
  return (state, { contractCode }) => ({
    chartData: selectTimeSeries(state, contractCode),
  });
};

const Chart = ({ chartData, contractCode }) =>
  chartData &&
  chartData.length > 0 &&
  Object.keys(chartData[0].data).length > 1 && (
    <LineChart
      data={chartData}
      colors={colors}
      library={config(chartData[0].min, chartData[0].max)}
    />
  );

export default connect(makeMapStateToProps)(Chart);
