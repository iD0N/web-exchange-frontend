import moment from 'moment';

const config = {
  xAxis: {
    labels: {
      step: 2,
      formatter: function() {
        return moment(this.value).format('MMM Do H:mm');
      },
    },
  },
  tooltip: {
    useHTML: true,
    formatter: function() {
      return `<div class="comp-tooltip-wrapper"><div>${moment(this.x).format(
        'MMMM Do YYYY, H:mm:ss'
      )}<br/></div><div><div class="comp-chart-legend-block" style="background:${
        this.series.color
      }"></div><div class="comp-series-wrapper">${this.series.name}: <b>${
        this.y
      }%</b></div></div></div>`;
    },
  },
  chart: {
    resetZoomButton: { position: { align: 'left', x: 5, y: -10 } },
    zoomType: 'x',
    animation: false,
  },
  plotOptions: {
    series: {
      animation: false,
      marker: {
        enabled: false,
      },
    },
  },
};

export default config;
