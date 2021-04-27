import { ZERO_SIZE_STRING } from '../../../constants';

import {
  pickLevelPriceInt,
  pickLevelPrice,
  pickLevelSize,
  appendPriceInt,
  createLevelFromPrice,
  convertChangesToLevels,
  calcMax,
  normalizeAsks,
  normalizeBids,
  normalizeSpread,
  percentOfMax,
  createPercentOf,
  aggPriceLevelBid,
  aggPriceLevelAsk,
  generateLevelsDescending,
  generateLevelsAscending,
  levelsHeightAvailable,
} from './helpers';
import { LEVEL_SIDES } from './constants';

const levels = [
  { size: 99, volume: 1 },
  { size: 98, volume: 4 },
  { size: 94, volume: 8 },
  { size: 5, volume: 100 },
];

describe('features/trader/features/order-book/utils/helpers.js', () => {
  const levelMock = ['99.90', '100.01', 99.9];
  const levelMockZeroSize = ['99.90', ZERO_SIZE_STRING, 99.9];

  describe('#pickLevelPrice', () => {
    it('should select the price string from the level (0th index)', () => {
      expect(pickLevelPrice(levelMock)).toBe('99.90');
    });
  });

  describe('#pickLevelSize', () => {
    it('should select the size string from the level (1st index)', () => {
      expect(pickLevelSize(levelMock)).toBe('100.01');
    });
  });

  describe('#pickLevelPriceInt', () => {
    it('should select the price integer from the level (2th index)', () => {
      expect(pickLevelPriceInt(levelMock)).toBe(99.9);
    });
  });

  describe('#appendPriceInt', () => {
    it('should append the 0th index converted to an integer as the 2nd index', () => {
      const levelWithoutPriceInt = levelMock.slice(0, 2);
      expect(appendPriceInt(levelWithoutPriceInt)).toEqual(levelMock);
    });
  });

  describe('#createLevelFromPrice', () => {
    it('should create a level representation from the change by shifting, adding zero size, and pushing the integer price', () => {
      const price = '99.90';
      expect(createLevelFromPrice(price)).toEqual(levelMockZeroSize);
    });

    it('should accept the size parameter', () => {
      const price = '99.90';
      const size = '1.11';
      expect(createLevelFromPrice(price, size)).toEqual([price, size, 99.9]);
    });
  });

  describe('#convertChangesToLevels', () => {
    const changes = [
      ['ask', '99.90', '100.01'],
      ['ask', '99.89', '100.00'],
      ['bid', '99.88', '99.99'],
      ['bid', '99.87', '99.98'],
      ['spread', '99.86', '99.97'],
      ['spread', '99.85', '99.96'],
    ];
    it('should take an array of bids & ask changes and convert them to bid levels', () => {
      const bidResult = [
        ['99.88', '99.99', 99.88],
        ['99.87', '99.98', 99.87],
      ];
      expect(convertChangesToLevels(changes, LEVEL_SIDES.BID)).toEqual(bidResult);
    });
    it('should take an array of bids & ask changes and convert them to ask levels', () => {
      const askResult = [
        ['99.90', '100.01', 99.9],
        ['99.89', '100.00', 99.89],
      ];
      expect(convertChangesToLevels(changes, LEVEL_SIDES.ASK)).toEqual(askResult);
    });
    it('should take an array of bids & ask changes and convert them to spread levels', () => {
      const spreadesult = [
        ['99.86', '99.97', 99.86],
        ['99.85', '99.96', 99.85],
      ];
      expect(convertChangesToLevels(changes, LEVEL_SIDES.SPREAD)).toEqual(spreadesult);
    });
  });

  describe('#calcMax', () => {
    it('should take an array of objects and find the max value of the size key', () => {
      const key = 'size';
      expect(calcMax(levels, key)).toBe(99);
    });
    it('should take an array of objects and find the max value of the volume key', () => {
      const key = 'volume';
      expect(calcMax(levels, key)).toBe(100);
    });
  });

  describe('#percentOfMax', () => {
    const value = 10;
    const maxValue = 50;

    it('should return percentage of max', () => {
      expect(percentOfMax(value, maxValue)).toBe(20);
    });

    it('should return zero if falsy value', () => {
      expect(percentOfMax(0, maxValue)).toBe(0);
    });
  });

  describe('#createPercentOf', () => {
    const key = 'size';
    const level = levels[0];

    it('should return a function percentOfMax', () => {
      expect(createPercentOf(levels, key)(level)).toBe(100);
    });
  });

  describe('#normalizeBids', () => {
    it('should take an array of bids as an argument and output the expected array of object representations', () => {
      const bids = [
        ['99.55', '185', 99.55],
        ['99.5', '220', 99.5],
      ];
      const mySizesMap = { '99.55': { limit: '10.00' } };
      const resultBids = [
        {
          mySize: 10,
          price: '99.55',
          rowKey: '99.55-bid',
          side: 'bid',
          size: '185',
          sizeByType: { limit: '10.00' },
          total: 185,
          totalNotional: 18416.75,
        },
        {
          mySize: 0,
          price: '99.5',
          rowKey: '99.5-bid',
          side: 'bid',
          size: '220',
          sizeByType: {},
          total: 405,
          totalNotional: 40306.75,
        },
      ];
      expect(normalizeBids(bids, mySizesMap)).toEqual(resultBids);
    });
  });

  describe('#normalizeAsks', () => {
    it('should take an array of asks as an argument and output the expected array of object representations', () => {
      const asks = [
        ['99.9', '25', 99.9],
        ['99.95', '15', 99.95],
      ];
      const mySizesMap = { '99.9': { limit: '10.00' } };
      const result = [
        {
          mySize: 10,
          price: '99.9',
          side: 'ask',
          rowKey: '99.9-ask',
          size: '25',
          sizeByType: { limit: '10.00' },
          total: 40,
          totalNotional: 3996.75,
        },
        {
          mySize: 0,
          price: '99.95',
          rowKey: '99.95-ask',
          side: 'ask',
          size: '15',
          sizeByType: {},
          total: 15,
          totalNotional: 1499.25,
        },
      ];
      expect(normalizeAsks(asks, mySizesMap)).toEqual(result);
    });
  });

  describe('#normalizeSpread', () => {
    it('should take an array of spread as an argument and output the expected array of object representations', () => {
      const spread = [
        ['99.9', '25', 99.9],
        ['99.95', '15', 99.95],
      ];
      const mySizesMap = { '99.9': { limit: '10.00' } };
      const resultSpreads = [
        {
          mySize: 10,
          price: '99.9',
          rowKey: '99.9-spread',
          side: 'spread',
          size: '25',
          sizeByType: { limit: '10.00' },
          total: 25,
          totalNotional: 2497.5,
        },
        {
          mySize: 0,
          price: '99.95',
          rowKey: '99.95-spread',
          side: 'spread',
          size: '15',
          sizeByType: {},
          total: 40,
          totalNotional: 3996.75,
        },
      ];
      expect(normalizeSpread(spread, mySizesMap)).toEqual(resultSpreads);
    });
  });

  describe('#aggPriceLevelBid', () => {
    const price = 99;
    const aggregation = 10;
    const priceDecimals = 2;
    it('should aggregate price level with `Math.floor`', () => {
      expect(aggPriceLevelBid(price, aggregation, priceDecimals)).toBe('90.00');
    });
  });

  describe('#aggPriceLevelAsk', () => {
    const price = 91;
    const aggregation = 10;
    const priceDecimals = 2;
    it('should aggregate price level with `Math.ceil`', () => {
      expect(aggPriceLevelAsk(price, aggregation, priceDecimals)).toBe('100.00');
    });
  });

  describe('#generateLevels', () => {
    const firstLevelPrice = 100;
    const count = 2;
    const aggregation = 0.5;
    const priceDecimals = 2;
    const sizeFn = a => a;

    describe('#generateLevelsDescending', () => {
      it('should generate levels descending', () => {
        const result = [
          ['100.00', 0, 100],
          ['99.50', 0, 99.5],
        ];

        expect(
          generateLevelsDescending(firstLevelPrice, count, aggregation, priceDecimals, sizeFn)
        ).toEqual(result);
      });

      it('should generate levels descending but not return any levels with negative prices', () => {
        const aggregation = 200;
        const result = [['100.00', 0, 100]];

        expect(
          generateLevelsDescending(firstLevelPrice, count, aggregation, priceDecimals, sizeFn)
        ).toEqual(result);
      });
    });

    describe('#generateLevelsAscending', () => {
      it('should generate levels ascending', () => {
        const result = [
          ['100.50', 0, 100.5],
          ['100.00', 0, 100],
        ];

        expect(
          generateLevelsAscending(firstLevelPrice, count, aggregation, priceDecimals, sizeFn)
        ).toEqual(result);
      });
    });
  });

  describe('#levelsHeightAvailable', () => {
    const widgetHeight = 5;

    it('should calc height with tradeMode enabled', () => {
      const tradeEnabled = true;
      expect(levelsHeightAvailable(widgetHeight, tradeEnabled).toNumber()).toEqual(274);
    });

    it('should calc height with tradeMode disabled', () => {
      const tradeEnabled = false;
      expect(levelsHeightAvailable(widgetHeight, tradeEnabled).toNumber()).toEqual(322);
    });
  });
});
