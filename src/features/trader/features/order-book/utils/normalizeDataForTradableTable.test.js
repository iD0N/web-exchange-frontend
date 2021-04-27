import normalizeDataForTradableTable from './normalizeDataForTradableTable';

describe('features/trader/features/order-book/utils/normalizeDataForTradableTable.js', () => {
  describe('#normalizeDataForTradableTable', () => {
    const asks = [['3650.00', '431.9622', 3650]];
    const bids = [['3649.50', '425.0931', 3649.5]];
    const myOrderSizes = {};
    const aggregation = 0.5;
    const levelsPerSide = 1;
    const stickyPrice = '3649.50';
    const priceDecimals = 2;

    it('should return asks, bids and no spread', () => {
      const result = {
        asks: [
          {
            mySize: 0,
            percentOfMax: { total: 100 },
            price: '3650.00',
            rowKey: '3650.00-ask',
            side: 'ask',
            size: '431.9622',
            sizeByType: {},
            total: 431.9622,
            totalNotional: 1576662.03,
          },
        ],
        bids: [
          {
            mySize: 0,
            percentOfMax: { total: 98 },
            price: '3649.50',
            rowKey: '3649.50-bid',
            side: 'bid',
            size: '425.0931',
            sizeByType: {},
            total: 425.0931,
            totalNotional: 1551377.26845,
          },
        ],
        spread: [],
      };

      expect(
        normalizeDataForTradableTable(asks, bids, myOrderSizes, {
          aggregation,
          levelsPerSide,
          stickyPrice,
          priceDecimals,
        })
      ).toEqual(result);
    });

    it('should return asks, bids, and spread', () => {
      const bids = [['3649', '425.0931', 3649]];
      const levelsPerSide = 2;

      const result = {
        asks: [
          {
            mySize: 0,
            percentOfMax: { total: 100 },
            price: '3650.50',
            rowKey: '3650.50-ask',
            side: 'ask',
            size: '0.0000',
            sizeByType: {},
            total: 431.9622,
            totalNotional: 1576662.03,
          },
          {
            mySize: 0,
            percentOfMax: { total: 100 },
            price: '3650.00',
            rowKey: '3650.00-ask',
            side: 'ask',
            size: '431.9622',
            sizeByType: {},
            total: 431.9622,
            totalNotional: 1576662.03,
          },
        ],
        bids: [
          {
            mySize: 0,
            percentOfMax: { total: 98 },
            price: '3649.00',
            rowKey: '3649.00-bid',
            side: 'bid',
            size: '425.0931',
            sizeByType: {},
            total: 425.0931,
            totalNotional: 1551164.7219,
          },
        ],
        spread: [
          {
            mySize: 0,
            price: '3649.50',
            rowKey: '3649.50-spread',
            side: 'spread',
            size: 0,
            sizeByType: {},
            total: 0,
            totalNotional: 0,
          },
        ],
      };

      expect(
        normalizeDataForTradableTable(asks, bids, myOrderSizes, {
          aggregation,
          levelsPerSide,
          stickyPrice,
          priceDecimals,
        })
      ).toEqual(result);
    });

    it('should return spread and asks', () => {
      const bids = [];

      const result = {
        asks: [
          {
            mySize: 0,
            percentOfMax: { total: 100 },
            price: '3650.00',
            rowKey: '3650.00-ask',
            side: 'ask',
            size: '431.9622',
            sizeByType: {},
            total: 431.9622,
            totalNotional: 1576662.03,
          },
        ],
        bids: [],
        spread: [
          {
            mySize: 0,
            price: '3649.50',
            rowKey: '3649.50-spread',
            side: 'spread',
            size: 0,
            sizeByType: {},
            total: 0,
            totalNotional: 0,
          },
        ],
      };

      expect(
        normalizeDataForTradableTable(asks, bids, myOrderSizes, {
          aggregation,
          levelsPerSide,
          stickyPrice,
          priceDecimals,
        })
      ).toEqual(result);
    });

    it('should return spread and bids', () => {
      const asks = [];

      const result = {
        asks: [],
        bids: [
          {
            mySize: 0,
            percentOfMax: { total: 100 },
            price: '3649.50',
            rowKey: '3649.50-bid',
            side: 'bid',
            size: '425.0931',
            sizeByType: {},
            total: 425.0931,
            totalNotional: 1551377.26845,
          },
        ],
        spread: [
          {
            mySize: 0,
            price: '3650.00',
            rowKey: '3650.00-spread',
            side: 'spread',
            size: 0,
            sizeByType: {},
            total: 0,
            totalNotional: 0,
          },
        ],
      };

      expect(
        normalizeDataForTradableTable(asks, bids, myOrderSizes, {
          aggregation,
          levelsPerSide,
          stickyPrice,
          priceDecimals,
        })
      ).toEqual(result);
    });

    it('should return only spread', () => {
      const asks = [];
      const bids = [];

      const result = {
        asks: [],
        bids: [],
        spread: [
          {
            mySize: 0,
            price: '3650.00',
            rowKey: '3650.00-spread',
            side: 'spread',
            size: 0,
            sizeByType: {},
            total: 0,
            totalNotional: 0,
          },
          {
            mySize: 0,
            price: '3649.50',
            rowKey: '3649.50-spread',
            side: 'spread',
            size: 0,
            sizeByType: {},
            total: 0,
            totalNotional: 0,
          },
        ],
      };

      expect(
        normalizeDataForTradableTable(asks, bids, myOrderSizes, {
          aggregation,
          levelsPerSide,
          stickyPrice,
          priceDecimals,
        })
      ).toEqual(result);
    });

    it('should return only asks', () => {
      const bids = [];
      const stickyPrice = '3660.50';

      const result = {
        asks: [
          {
            mySize: 0,
            percentOfMax: { total: 0 },
            price: '3661.00',
            rowKey: '3661.00-ask',
            side: 'ask',
            size: '0.0000',
            sizeByType: {},
            total: 0,
            totalNotional: 0,
          },
          {
            mySize: 0,
            percentOfMax: { total: 0 },
            price: '3660.50',
            rowKey: '3660.50-ask',
            side: 'ask',
            size: '0.0000',
            sizeByType: {},
            total: 0,
            totalNotional: 0,
          },
        ],
        bids: [],
        spread: [],
      };

      expect(
        normalizeDataForTradableTable(asks, bids, myOrderSizes, {
          aggregation,
          levelsPerSide,
          stickyPrice,
          priceDecimals,
        })
      ).toEqual(result);
    });

    it('should return only bids', () => {
      const asks = [];
      const stickyPrice = '3640.50';

      const result = {
        asks: [],
        bids: [
          {
            mySize: 0,
            percentOfMax: { total: 0 },
            price: '3641.00',
            rowKey: '3641.00-bid',
            side: 'bid',
            size: '0.0000',
            sizeByType: {},
            total: 0,
            totalNotional: 0,
          },
          {
            mySize: 0,
            percentOfMax: { total: 0 },
            price: '3640.50',
            rowKey: '3640.50-bid',
            side: 'bid',
            size: '0.0000',
            sizeByType: {},
            total: 0,
            totalNotional: 0,
          },
        ],
        spread: [],
      };

      expect(
        normalizeDataForTradableTable(asks, bids, myOrderSizes, {
          aggregation,
          levelsPerSide,
          stickyPrice,
          priceDecimals,
        })
      ).toEqual(result);
    });
  });
});
