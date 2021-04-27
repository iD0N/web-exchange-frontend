import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import localStorage from 'localStorage';

import { i18nInstance } from '../../../../common/services/i18n';
import { CONTRACT_TYPE } from '../../../../common/enums';
import { IsMobile, Spin } from '../../../../common/components';
import { GridLayoutTile, WidgetHeader } from '../../components';
import TradeModeToggle from '../trade-mode/components/TradeModeToggle'; // TODO uplift

import quoteFeedService from './services/quoteFeed';
import asyncLoadTradingView from './asyncLoadTradingView';
import TickerSeries from './components/TickerSeries';
import TradeFromChart from './components/TradeFromChart';

import Datafeed from './datafeed';
import { cleanInterval, supportedCandleTypes, supportedResolutions } from './config';

const defaultConfig = { panes: [], studies: [] };

let initialConfigLoaded = false;
let tvLoaded = false;
let switchSymbolOnReady = () => {};
let switchSymbolRetries = 0;
let drawingBarOn = true;

let lastPriceHovered;
const getPriceHovered = () => lastPriceHovered;

const getWidgetOptions = ({
  initialContractCode,
  interval,
  isMobile,
  contractsMetadata,
  quoteFeed,
  setChartUpdater,
  setResolution,
  tradeEnabled,
}) => ({
  debug: false,
  symbol: `ACDX:${initialContractCode}`,
  datafeed: Datafeed({ contractsMetadata, quoteFeed, setChartUpdater, setResolution }), // our datafeed object
  interval,
  container_id: 'tv_chart_container',
  library_path: '/charting_library/',
  custom_css_url: '/charting_library/style.css',
  locale: i18nInstance.language,
  disabled_features: isMobile ? ['left_toolbar', 'legend_context_menu'] : [],
  enabled_features: ['adaptive_logo', 'narrow_chart_enabled', 'study_market_minimized'],
  fullscreen: false,
  autosize: true,
  theme: 'Dark',
  timezone:
    (Intl && Intl.DateTimeFormat && Intl.DateTimeFormat().resolvedOptions().timeZone) || 'Etc/UTC',
  overrides: {
    'paneProperties.background': '#011921',
    'paneProperties.vertGridProperties.color': '#144654',
    'paneProperties.horzGridProperties.color': '#144654',
    'paneProperties.legendProperties.showSeriesOHLC': !isMobile,
    'paneProperties.legendProperties.showLegend': !isMobile,
    'symbolWatermarkProperties.transparency': 10,
    'scalesProperties.textColor': '#808e9d',
    'mainSeriesProperties.candleStyle.wickUpColor': '#33d68a',
    'mainSeriesProperties.candleStyle.wickDownColor': '#fc6058',
    'symbolWatermarkProperties.color': 'rgba(0, 0, 0, 0.00)',
    'mainSeriesProperties.areaStyle.color1': '#33d68a',
    'mainSeriesProperties.areaStyle.color2': '#117e8a',
    'mainSeriesProperties.areaStyle.linecolor': '#33d68a',
    'mainSeriesProperties.lineStyle.color': '#33d68a',
    // 'paneProperties.axisProperties.autoScale': true
  },
  toolbar_bg: '#011921',
  loading_screen: {
    backgroundColor: '#011921',
    foregroundColor: '#808e9d',
  },
});

class ChartWidget extends Component {
  static propTypes = {
    TradingView: PropTypes.object,
    config: PropTypes.object,
    contractsMetadata: PropTypes.object,
    globalContract: PropTypes.object.isRequired,
  };

  static defaultProps = {
    isFetchingConfig: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      widgetOptions: {},
      updater: {},
      resolution: '5',
      chartReady: false,
    };
  }

  componentDidMount() {
    if (
      !!this.props.TradingView &&
      !!this.props.config &&
      !!this.props.globalContract &&
      !!this.props.contractsMetadata
    ) {
      this.loadChart();
    }
  }

  componentDidUpdate(
    {
      TradingView: hadTV,
      config: hadConfig,
      globalContract: prevGlobalContract,
      contractsMetadata: hadContractsMetadata,
      tradeEnabled: prevTradeEnabled,
    },
    { chartReady: prevChartReady }
  ) {
    if (
      (!hadTV || !hadConfig || !prevGlobalContract || !hadContractsMetadata) &&
      !!this.props.TradingView &&
      !!this.props.config &&
      !!this.props.globalContract &&
      !!this.props.contractsMetadata
    ) {
      this.loadChart();
    }

    if (window.tvWidget) {
      if (prevGlobalContract.contractCode !== this.props.globalContract.contractCode) {
        const switchSymbol = () => {
          this.setState({ chartReady: false });
          try {
            const interval =
              this.props.config && this.props.config.layout && this.props.config.layout.tvInterval
                ? this.props.config.layout.tvInterval
                : '5';
            window.tvWidget.setSymbol(
              'ACDX:' + this.props.globalContract.contractCode,
              interval,
              this.addSeriesIndexPrice
            );
            this.setState({ chartReady: true });
          } catch (err) {
            if (switchSymbolRetries < 5) {
              setTimeout(switchSymbol, 1000);
              switchSymbolRetries++;
            }
          }
        };
        if (!tvLoaded) {
          switchSymbolOnReady = switchSymbol;
          return;
        }
        switchSymbol();
      }
      try {
        if (prevTradeEnabled !== this.props.tradeEnabled && window.tvWidget.chart) {
          const drawingToolbarOpen = window.tvWidget
            .chart()
            .getCheckableActionState('drawingToolbarAction');
          if (this.props.tradeEnabled) {
            // toggling into trade-mode
            if (drawingToolbarOpen) {
              // drawing bar is open, closing for trade-mode
              drawingBarOn = true;
              window.tvWidget.chart().executeActionById('drawingToolbarAction');
            } else {
              // marking for non-tfc case, drawing bar was off
              drawingBarOn = false;
            }
          } else if (!this.props.tradeEnabled) {
            // toggling out of trade-mode, turn on draw bar if was on when toggled to trade-mode
            if (drawingBarOn && !drawingToolbarOpen) {
              window.tvWidget.chart().executeActionById('drawingToolbarAction');
              drawingBarOn = true;
            }
          }
        }
      } catch(err) {
        
      }
    }
  }

  removeAllIndexSeriesPrices = () => {
    const studyTemplate = window.tvWidget.chart().createStudyTemplate({ saveInterval: false });
    const indexSeriesIds = [];
    studyTemplate.panes.forEach(pane => {
      pane.sources.forEach(({ id, state, type }) => {
        if (
          type === 'study_Overlay' &&
          state &&
          state.inputs &&
          state.inputs.symbol &&
          (state.inputs.symbol.substring(0, 6) === 'ACDX:.' ||
            state.inputs.symbol.substring(0, 1) === '.')
        ) {
          indexSeriesIds.push(id);
        }
      });
    });
    indexSeriesIds.forEach(id => window.tvWidget.chart().removeEntity(id));
  };

  addSeriesIndexPrice = async () => {
    const { globalContract } = this.props;

    this.removeAllIndexSeriesPrices();

    if ([CONTRACT_TYPE.SPOT, CONTRACT_TYPE.FUTURE_SPREAD].includes(globalContract.type)) {
      return;
    }

    let indexPriceStudyId;

    try {
      indexPriceStudyId = await window.tvWidget
        .chart()
        .createStudy('Overlay', true, false, [`ACDX:.${globalContract.contractCode}`], undefined, {
          style: 2,
          showPriceLine: false,
          // showPriceLine: true,
          'lineStyle.color': '#c7d5da',
        });
    } catch (err) {
      setTimeout(this.addSeriesIndexPrice, 500);
      return;
    }

    try {
      window.tvWidget
        .chart()
        .getStudyById(indexPriceStudyId)
        .changePriceScale('right');
    } catch (err) {}
  };

  loadChart = () => {
    const { config, contractsMetadata, globalContract, isMobile, tradeEnabled } = this.props;
    let interval = '5';
    let candleType = 1;

    const contracts = { ...contractsMetadata };

    if (config && config.layout) {
      if (config.layout.tvInterval && supportedResolutions.includes(config.layout.tvInterval)) {
        interval = config.layout.tvInterval;
      }
      if (supportedCandleTypes.includes(config.layout.tvCandleType)) {
        candleType = config.layout.tvCandleType;
      }
    }

    this.setState(
      {
        widgetOptions: getWidgetOptions({
          interval,
          contractsMetadata: contracts,
          initialContractCode: globalContract.contractCode,
          isMobile,
          quoteFeed: quoteFeedService({ contractsMetadata }),
          setChartUpdater: this.setChartUpdater,
          setResolution: this.setResolution,
          tradeEnabled,
        }),
      },
      () => {
        try {
          const widget = (window.tvWidget = new this.props.TradingView.widget(
            this.state.widgetOptions
          ));
          widget.onChartReady(() => {
            tvLoaded = true;
            switchSymbolOnReady();

            widget.chart().setChartType(candleType);
            this.addSeriesIndexPrice();
            widget
              .chart()
              .onSymbolChanged()
              .subscribe(null, this.toggleGlobalContract);
            widget
              .chart()
              .onIntervalChanged()
              .subscribe(null, this.updateInterval);
            widget.chart().crossHairMoved(this.trackCrosshair);
            widget.subscribe('onAutoSaveNeeded', this.saveTvConfig);
            widget
              .chart()
              .onIntervalChanged()
              .subscribe(null, this.updateInterval);

            this.loadSavedTvConfig();
            this.setState({ chartReady: true });
          });
        } catch (err) {
          // console.log('Failed to load tradingview.');
        }
      }
    );
  };

  toggleGlobalContract = ({ ticker }) => {
    const {
      globalContract: { contractCode },
      setGlobalContract,
    } = this.props;
    if (ticker !== contractCode) {
      setGlobalContract(ticker);
    }
  };

  setChartUpdater = (contractCode, updater) => {

    this.setState({ updater: { ...this.state.updater, [contractCode]: updater } });
  };
  setResolution = resolution => {
    let minutes;
    if (String(resolution).match('D')) {
      minutes = Number(String(resolution).replace('D', '') || 1) * 1440;
    } else if (String(resolution).match('W')) {
      minutes = Number(String(resolution).replace('W', '') || 1) * 10080;
    } else {
      minutes = Number(resolution);
    }
    this.setState({ resolution: minutes * 60 * 1000 });
    // resolution in ms
  };

  updateInterval = interval => {
    const newConfig = { ...this.props.config };
    if (!newConfig.layout) {
      newConfig.tvConfig = {};
    }

    newConfig.layout.tvInterval = cleanInterval(interval);

    this.props.changeConfig(newConfig);
  };

  trackCrosshair = ({ price }) => {
    lastPriceHovered = price;
  };

  loadSavedTvConfig = () => {
    const tvConfig = this.getSavedTvConfig();
    const { panes, studies } = tvConfig || defaultConfig;
    if (!studies || !panes || (studies.length === 0 && panes.length === 0)) {
      return;
    }

    const currentTemplate = window.tvWidget.chart().createStudyTemplate({ saveInterval: false });
    currentTemplate.panes[0].sources = currentTemplate.panes[0].sources.concat(studies);
    currentTemplate.panes[0].rightAxisSources = currentTemplate.panes[0].rightAxisSources.concat(
      studies.map(({ id }) => id)
    );
    currentTemplate.panes = currentTemplate.panes.concat(panes);
    window.tvWidget.chart().applyStudyTemplate(currentTemplate);
  };

  saveTvConfig = () => {
    const { changeConfig, config, globalContract, isLoggedIn } = this.props;
    if (!initialConfigLoaded) {
      initialConfigLoaded = true;
      if (![CONTRACT_TYPE.SPOT, CONTRACT_TYPE.FUTURE_SPREAD].includes(globalContract.type)) {
        // ignore first call of this event (we instantiate this with the index series addition)
        return;
      }
    }

    const nextConfig = this.getNonDefaultTvConfig();
    const prevConfig = this.getSavedTvConfig();

    if (JSON.stringify(nextConfig) === JSON.stringify(prevConfig)) {
      const newConfig = { ...config };
      newConfig.layout.tvCandleType = window.tvWidget.chart().chartType();
      changeConfig(newConfig);
      return;
    }

    if (isLoggedIn) {
      const newConfig = { ...config };
      newConfig.layout.tvCandleType = window.tvWidget.chart().chartType();
      newConfig.tvConfig = JSON.stringify(nextConfig);
      changeConfig(newConfig);
      return;
    }

    try {
      localStorage.setItem('tvConfig', JSON.stringify(nextConfig));
    } catch (err) {
      //console.log(err);
    }
  };

  getSavedTvConfig = () => {
    const { config, isLoggedIn } = this.props;

    let tvConfig = defaultConfig;
    try {
      tvConfig =
        (isLoggedIn ? config.tvConfig : localStorage.getItem('tvConfig')) ||
        JSON.stringify(defaultConfig);
      tvConfig = JSON.parse(tvConfig);
    } catch (err) {}
    return tvConfig;
  };

  getNonDefaultTvConfig = () => {
    const template = window.tvWidget.chart().createStudyTemplate({ saveInterval: false });
    const studies = [...template.panes[0].sources];
    let l = studies.length;
    while (l--) {
      if (
        studies[l].type === 'MainSeries' ||
        (l === 1 && studies[l].state.description === 'Volume') ||
        (studies[l].type === 'study_Overlay' &&
          (studies[l].state.inputs.symbol.substring(0, 6) === 'ACDX:.' ||
            studies[l].state.inputs.symbol.substring(0, 1) === '.'))
      ) {
        studies.splice(l, 1);
      }
    }
    const panes = template.panes.slice(1);
    return { panes, studies };
  };

  render() {
    const { isMobile, globalContract, TradingView, config } = this.props;
    const { chartReady, resolution, updater, widgetOptions } = this.state;

    const loadingTV = !TradingView;

    return loadingTV || !config ? (
      <Spin spinning>
        <GridLayoutTile
          title={<WidgetHeader title={<Trans i18nKey="trader.chart.title">Chart</Trans>} />}
        />
      </Spin>
    ) : (
      <>
        <TickerSeries
          globalContractCode={globalContract.contractCode}
          resolution={resolution}
          updater={updater}
        />
        <GridLayoutTile
          title={<WidgetHeader title={<Trans i18nKey="trader.chart.title">Chart</Trans>} />}
          controls={<TradeModeToggle />}
          contentClassName="trader-chart-widget"
          content={
            <>
              <TradeFromChart
                minimumPriceIncrement={globalContract.minimumPriceIncrement}
                chartReady={chartReady}
                isMobile={isMobile}
                getPriceHovered={getPriceHovered}
              />
              <div className="TVChartContainer" id={widgetOptions.container_id} />
            </>
          }
        />
      </>
    );
  }
}

export default asyncLoadTradingView(IsMobile(ChartWidget));
