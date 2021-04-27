import { GRID_LAYOUT_COLS } from './constants';

export const LAYOUT_VERSION = 1.2;

export const widgetConfigIds = {
  Chart: 'chart',
  OrderBook: 'orderBook',
  TimeAndSales: 'timeAndSales',
  Positions: 'positions',
  Orders: 'orders',
  OrderEntry: 'orderEntry',
  ContractDetails: 'contractDetails',
  AccountDetails: 'accountDetails',
};

const chartConfigCreator = createWidgetConfigCreator(widgetConfigIds.Chart, { minW: 3 });

const orderBookConfigCreator = createWidgetConfigCreator(widgetConfigIds.OrderBook, {
  minW: 1,
  minH: 4,
  maxH: 10,
});

const timeAndSalesConfigCreator = createWidgetConfigCreator(widgetConfigIds.TimeAndSales, {
  minW: 1,
  minH: 3,
});

const positionsConfigCreator = createWidgetConfigCreator(widgetConfigIds.Positions, { minH: 2 });

const ordersConfigCreator = createWidgetConfigCreator(widgetConfigIds.Orders, { minH: 2 });
const orderEntryConfigCreator = createWidgetConfigCreator(widgetConfigIds.OrderEntry, {
  minH: 4,
  minW: 1,
});

const contractDetailsConfigCreator = createWidgetConfigCreator(widgetConfigIds.ContractDetails, {
  minH: 1,
  minW: 1,
});

const accountDetailsConfigCreator = createWidgetConfigCreator(widgetConfigIds.AccountDetails, {
  minH: 1,
  minW: 1,
});

export const layouts = {
  STANDARD: {
    id: 'STANDARD',
    config: [
      chartConfigCreator({ x: 0, y: 0, w: 6, h: 5 }),
      orderEntryConfigCreator({ x: 6, y: 0, w: 3, h: 5 }),
      orderBookConfigCreator({ x: 9, y: 0, w: 3, h: 8 }),
      contractDetailsConfigCreator({ x: 0, y: 5, w: 3, h: 3 }),
      accountDetailsConfigCreator({ x: 3, y: 5, w: 3, h: 3 }),
      timeAndSalesConfigCreator({ x: 6, y: 5, w: 3, h: 3 }),
      positionsConfigCreator({ x: 0, y: 8, w: 12, h: 3 }),
      ordersConfigCreator({ x: 0, y: 11, w: 12, h: 3 }),
    ],
  },
  COMPACT: {
    id: 'COMPACT',
    config: [
      orderEntryConfigCreator({ x: 0, y: 0, w: 3, h: 5 }),
      chartConfigCreator({ x: 3, y: 0, w: 3, h: 5 }),
      orderBookConfigCreator({ x: 6, y: 0, w: 3, h: 5 }),
      timeAndSalesConfigCreator({ x: 9, y: 0, w: 3, h: 5 }),
      positionsConfigCreator({ x: 0, y: 3, w: 12, h: 2 }),
      ordersConfigCreator({ x: 0, y: 5, w: 12, h: 2 }),
    ],
  },
  CHART_FOCUSED: {
    id: 'CHART_FOCUSED',
    config: [
      chartConfigCreator({ x: 0, y: 0, w: 12, h: 5 }),
      orderEntryConfigCreator({ x: 0, y: 5, w: 3, h: 6 }),
      orderBookConfigCreator({ x: 3, y: 5, w: 5, h: 6 }),
      timeAndSalesConfigCreator({ x: 8, y: 5, w: 4, h: 6 }),
      positionsConfigCreator({ x: 0, y: 10, w: 12, h: 2 }),
      ordersConfigCreator({ x: 0, y: 10, w: 12, h: 2 }),
    ],
  },
/*
  MOBILE: {
    id: 'MOBILE',
    config: [
    //  chartConfigCreator({ x: 0, y: 0, w: GRID_LAYOUT_COLS, h: 6 }),
      positionsConfigCreator({ x: 0, y: 0, w: GRID_LAYOUT_COLS, h: 3 }),
      ordersConfigCreator({ x: 0, y: 3, w: GRID_LAYOUT_COLS, h: 3 }),
      orderBookConfigCreator({ x: 0, y: 6, w: GRID_LAYOUT_COLS, h: 4 }),
      timeAndSalesConfigCreator({ x: 0, y: 11, w: GRID_LAYOUT_COLS, h: 5 }),
    ],
  },
*/
  MOBILE: {
    id: 'MOBILE',
    config: [
    //  chartConfigCreator({ x: 0, y: 0, w: GRID_LAYOUT_COLS, h: 4 }),
      accountDetailsConfigCreator({ x: 0, y: 0, w: GRID_LAYOUT_COLS, h: 3 }),
      orderBookConfigCreator({ x: 0, y: 3, w: GRID_LAYOUT_COLS, h: 4 }),
      orderEntryConfigCreator({ x: 0, y: 7, w: GRID_LAYOUT_COLS, h: 5 }),
      timeAndSalesConfigCreator({ x: 0, y: 13, w: GRID_LAYOUT_COLS, h: 3 }),
      positionsConfigCreator({ x: 0, y: 16, w: GRID_LAYOUT_COLS, h: 3 }),
      ordersConfigCreator({ x: 0, y: 19, w: GRID_LAYOUT_COLS, h: 3 }),
    ],
  },
  MOBILE_LOGGED_OUT: {
    id: 'MOBILE_LOGGED_OUT',
    config: [
    //  chartConfigCreator({ x: 0, y: 0, w: GRID_LAYOUT_COLS, h: 4 }),
      orderBookConfigCreator({ x: 0, y: 0, w: GRID_LAYOUT_COLS, h: 4 }),
      orderEntryConfigCreator({ x: 0, y: 4, w: GRID_LAYOUT_COLS, h: 5 }),
      timeAndSalesConfigCreator({ x: 0, y: 10, w: GRID_LAYOUT_COLS, h: 3 }),
      positionsConfigCreator({ x: 0, y: 13, w: GRID_LAYOUT_COLS, h: 3 }),
      ordersConfigCreator({ x: 0, y: 16, w: GRID_LAYOUT_COLS, h: 3 }),
    ],
  },
};

function createWidgetConfigCreator(widgetConfigKey, defaultConfig = {}) {
  return (config = {}) => {
    const mergedConfig = {
      i: widgetConfigKey,
      ...defaultConfig,
      ...config,
    };

    if (
      mergedConfig.x === undefined ||
      mergedConfig.y === undefined ||
      mergedConfig.w === undefined ||
      mergedConfig.h === undefined
    ) {
      console.warn(`Missing config params in widget "${widgetConfigKey}"`);
    }

    return mergedConfig;
  };
}
