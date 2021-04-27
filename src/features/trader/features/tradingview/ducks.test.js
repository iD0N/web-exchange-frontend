import defaultChartConfig from './config';
import { CHART_CONFIG_VALUE_KEY, selectChartConfig } from './ducks';

const createState = (chartConfig, contracts = []) => ({
  traderDataStore: {
    contracts,
  },
  keyValueStore: {
    values: {
      [CHART_CONFIG_VALUE_KEY]: chartConfig,
    },
  },
});

const createValidState = ({ layout = {}, ...config }, contracts) =>
  createState({ layout: JSON.stringify(layout), ...config }, contracts);

describe('feature/chart/ducks.js', () => {
  describe('selectChartConfig', () => {
    describe('when layout is not parseable', () => {
      const notSerializedLayout = {};

      const brokenState = createState({
        layout: notSerializedLayout,
      });

      it('should return default chart config', () => {
        expect(selectChartConfig(brokenState)).toEqual(defaultChartConfig);
      });
    });
  });
});
