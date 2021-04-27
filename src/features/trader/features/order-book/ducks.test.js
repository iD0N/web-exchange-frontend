import { selectOrderBook, selectOrderBookData, selectOrderBookLevels } from './ducks';

describe('features/trader/features/order-book/ducks.js', () => {
  describe('selectors', () => {
    const data = {
      asks: [
        ['99.95', '15.0000', 99.95],
        ['99.9', '25.0000', 99.9],
        ['99.85', '90.0000', 99.85],
        ['99.8', '120.0000', 99.8],
        ['99.75', '145.0000', 99.75],
        ['99.7', '190.0000', 99.7],
        ['99.65', '160.0000', 99.65],
      ],
      bids: [
        ['99.55', '185.0000', 99.55],
        ['99.5', '220.0000', 99.5],
        ['99.45', '260.0000', 99.45],
        ['99.4', '290.0000', 99.4],
        ['99.35', '150.0000', 99.35],
        ['99.3', '90.0000', 99.3],
        ['99.25', '45.0000', 99.25],
      ],
    };

    const tableData = {
      asks: [
        {
          mySize: 0,
          percentOfMax: { total: 60 },
          price: '99.95',
          rowKey: '99.95-ask',
          side: 'ask',
          size: '15.0000',
          sizeByType: {},
          total: 745,
          totalNotional: 74310,
        },
        {
          mySize: 0,
          percentOfMax: { total: 59 },
          price: '99.90',
          rowKey: '99.90-ask',
          side: 'ask',
          size: '25.0000',
          sizeByType: {},
          total: 730,
          totalNotional: 72810.75,
        },
        {
          mySize: 0,
          percentOfMax: { total: 57 },
          price: '99.85',
          rowKey: '99.85-ask',
          side: 'ask',
          size: '90.0000',
          sizeByType: {},
          total: 705,
          totalNotional: 70313.25,
        },
        {
          mySize: 0,
          percentOfMax: { total: 50 },
          price: '99.80',
          rowKey: '99.80-ask',
          side: 'ask',
          size: '120.0000',
          sizeByType: {},
          total: 615,
          totalNotional: 61326.75,
        },
        {
          mySize: 0,
          percentOfMax: { total: 40 },
          price: '99.75',
          rowKey: '99.75-ask',
          side: 'ask',
          size: '145.0000',
          sizeByType: {},
          total: 495,
          totalNotional: 49350.75,
        },
        {
          mySize: 0,
          percentOfMax: { total: 28 },
          price: '99.70',
          rowKey: '99.70-ask',
          side: 'ask',
          size: '190.0000',
          sizeByType: {},
          total: 350,
          totalNotional: 34887,
        },
        {
          mySize: 0,
          percentOfMax: { total: 13 },
          price: '99.65',
          rowKey: '99.65-ask',
          side: 'ask',
          size: '160.0000',
          sizeByType: {},
          total: 160,
          totalNotional: 15944,
        },
      ],
      bids: [
        {
          mySize: 0,
          percentOfMax: { total: 15 },
          price: '99.55',
          rowKey: '99.55-bid',
          side: 'bid',
          size: '185.0000',
          sizeByType: {},
          total: 185,
          totalNotional: 18416.75,
        },
        {
          mySize: 0,
          percentOfMax: { total: 33 },
          price: '99.50',
          rowKey: '99.50-bid',
          side: 'bid',
          size: '220.0000',
          sizeByType: {},
          total: 405,
          totalNotional: 40306.75,
        },
        {
          mySize: 0,
          percentOfMax: { total: 54 },
          price: '99.45',
          rowKey: '99.45-bid',
          side: 'bid',
          size: '260.0000',
          sizeByType: {},
          total: 665,
          totalNotional: 66163.75,
        },
        {
          mySize: 0,
          percentOfMax: { total: 77 },
          price: '99.40',
          rowKey: '99.40-bid',
          side: 'bid',
          size: '290.0000',
          sizeByType: {},
          total: 955,
          totalNotional: 94989.75,
        },
        {
          mySize: 0,
          percentOfMax: { total: 89 },
          price: '99.35',
          rowKey: '99.35-bid',
          side: 'bid',
          size: '150.0000',
          sizeByType: {},
          total: 1105,
          totalNotional: 109892.25,
        },
        {
          mySize: 0,
          percentOfMax: { total: 96 },
          price: '99.30',
          rowKey: '99.30-bid',
          side: 'bid',
          size: '90.0000',
          sizeByType: {},
          total: 1195,
          totalNotional: 118829.25,
        },
        {
          mySize: 0,
          percentOfMax: { total: 100 },
          price: '99.25',
          rowKey: '99.25-bid',
          side: 'bid',
          size: '45.0000',
          sizeByType: {},
          total: 1240,
          totalNotional: 123295.5,
        },
      ],
      spread: [],
    };

    const state = {
      keyValueStore: {
        values: {
          gridLayout: { layout: [{ i: 'orderBook', x: 8, y: 0, w: 4, h: 5, minH: 5, maxH: 10 }] },
        },
      },
      orders: { openOrders: [] },
      traderDataStore: {
        contracts: [{ contractCode: 'BTC', priceDecimals: 2 }],
        globalContractCode: 'BTC',
      },
      orderBook: { data, priceDecimals: 2, aggregation: 0.05 },
    };

    describe('#selectOrderBook', () => {
      it('should return object by orderBook key', () => {
        expect(selectOrderBook(state)).toEqual(state.orderBook);
      });
    });

    describe('#selectOrderBookData', () => {
      it('should return object with keys asks and bids that are arrays', () => {
        expect(selectOrderBookData(state)).toEqual(
          expect.objectContaining({
            asks: expect.any(Array),
            bids: expect.any(Array),
          })
        );
      });
    });

    describe('#selectOrderBookLevels', () => {
      it('should return the expected data array', () => {
        expect(selectOrderBookLevels(state)).toEqual(tableData);
      });
    });
  });
});
