import { ORDER_TYPE } from '../../../../../common/enums';
import { ORDER_STATUS } from '../../orders/constants'; // TODO uplift
import { ZERO_SIZE_STRING } from '../../../constants';

import {
  applySizePercentage,
  normalizeDataForOrderBookTable,
  findMidMarket,
  generateMySizeMap,
} from './index';

describe('features/trader/features/order-book/utils/index.js', () => {
  describe('#applySizePercentage', () => {
    const askLevels = [{ mySize: 10, price: '99.9', size: '25', total: 40, side: 'ask' }];
    const bidLevels = [{ mySize: 10, price: '99.55', size: '185', total: 185, side: 'bid' }];
    const spreadLevels = [{ price: '100.55', size: '185', total: 185, side: 'spread' }];

    const result = {
      asks: [{ ...askLevels[0], percentOfMax: { total: 22 } }],
      bids: [{ ...bidLevels[0], percentOfMax: { total: 100 } }],
      spread: spreadLevels,
    };

    it('should apply size percentage to ask and bid levels and not touch spread', () => {
      expect(applySizePercentage(askLevels, bidLevels, spreadLevels)).toEqual(result);
    });
  });

  describe('#normalizeDataForOrderBookTable', () => {
    const asks = [['3650.00', '431.9622', 3650]];
    const bids = [['3649.50', '425.0931', 3649.5]];
    const myOrderSizes = { '3649.50': { limit: '10.00' } };
    const aggregation = 0.5;
    const levelsPerSide = 1;
    const stickyPrice = '3649.50';
    const priceDecimals = 2;
    const tradeEnabled = false;

    it('should normalize data for orderbook table', () => {
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
            mySize: 10,
            percentOfMax: { total: 98 },
            price: '3649.50',
            rowKey: '3649.50-bid',
            side: 'bid',
            size: '425.0931',
            sizeByType: { limit: '10.00' },
            total: 425.0931,
            totalNotional: 1551377.26845,
          },
        ],
        spread: [],
      };

      expect(
        normalizeDataForOrderBookTable(
          { asks, bids },
          myOrderSizes,
          aggregation,
          levelsPerSide,
          tradeEnabled,
          stickyPrice,
          priceDecimals
        )
      ).toEqual(result);
    });

    const emptyResult = {
      asks: [],
      bids: [],
      spread: [],
    };

    it('should return empty arrays if no asks provided', () => {
      const asks = [];

      expect(
        normalizeDataForOrderBookTable(
          { asks, bids },
          myOrderSizes,
          aggregation,
          levelsPerSide,
          tradeEnabled,
          stickyPrice,
          priceDecimals
        )
      ).toEqual(emptyResult);
    });

    it('should return empty arrays if no bids provided', () => {
      const bids = [];

      expect(
        normalizeDataForOrderBookTable(
          { asks, bids },
          myOrderSizes,
          aggregation,
          levelsPerSide,
          tradeEnabled,
          stickyPrice,
          priceDecimals
        )
      ).toEqual(emptyResult);
    });

    it('should return empty arrays if priceDecimals is falsy', () => {
      const priceDecimals = 0;

      expect(
        normalizeDataForOrderBookTable(
          { asks, bids },
          myOrderSizes,
          aggregation,
          levelsPerSide,
          tradeEnabled,
          stickyPrice,
          priceDecimals
        )
      ).toEqual(emptyResult);
    });
  });

  describe('#findMidMarket', () => {
    const aggregation = 0.5;
    const priceDecimals = 2;
    const levelsPerSide = 2;

    it('should find the mid market', () => {
      const asks = [
        ['3993.00', '994.8660', 3993],
        ['3992.50', '731.8640', 3992.5],
      ];
      const bids = [
        ['3992.00', '717.0763', 3992],
        ['3991.50', '996.8594', 3991.5],
      ];
      const result = '3992.00';
      expect(findMidMarket({ asks, bids, aggregation, priceDecimals, levelsPerSide })).toBe(result);
    });

    it('should return zero value if no levels provided', () => {
      const asks = [];
      const bids = [];
      const result = ZERO_SIZE_STRING;
      expect(findMidMarket({ asks, bids }, aggregation, priceDecimals, levelsPerSide)).toBe(result);
    });
  });

  describe('#generateMySizeMap', () => {
    const orders = [
      {
        orderType: ORDER_TYPE.LIMIT,
        price: '10000.00',
        rowKey: '10000.00-sell',
        side: 'sell',
        size: '1.0000',
        sizeFilled: '0.0000',
        status: ORDER_STATUS.ACCEPTED,
      },
      {
        orderType: ORDER_TYPE.LIMIT,
        price: '10000.00',
        rowKey: '10000.00-sell',
        side: 'sell',
        size: '0.0000',
        sizeFilled: '5.0000',
        status: ORDER_STATUS.ACCEPTED,
      },
    ];
    const rejectedOrder = { ...orders[0], status: ORDER_STATUS.REJECTED };
    const aggregation = 0.5;
    const priceDecimals = 2;

    it('should generate size map from user`s orders', () => {
      const result = { '10000.00': { limit: -4 } };
      expect(generateMySizeMap(orders, aggregation, priceDecimals)).toEqual(result);
    });

    it('should ignore not `accepted` orders', () => {
      expect(generateMySizeMap([rejectedOrder], aggregation, priceDecimals)).toEqual({});
    });
  });
});
