import { ZERO_SIZE_STRING } from '../../../constants';

import {
  adjustBidsForAskMismatch,
  handleMissingLevelEdgeCases,
  eliminateSpreadZerosBids,
  eliminateSpreadZerosAsks,
  eliminateSpreadZeros,
  applyZeroSizeRules,
  aggregateBidLevels,
  aggregateAskLevels,
  generateSpreadLevels,
} from './adjustBook';

describe('features/trader/features/order-book/utils/adjustBook.js', () => {
  const bidsMock = [
    ['99.98', ZERO_SIZE_STRING, 99.98],
    ['99.97', ZERO_SIZE_STRING, 99.97],
    ['99.96', '5.0030', 99.96],
    ['99.95', ZERO_SIZE_STRING, 99.95],
    ['99.94', '2.1345', 99.94],
    ['99.93', ZERO_SIZE_STRING, 99.93],
    ['99.92', ZERO_SIZE_STRING, 99.92],
  ];

  const asksMock = [
    ['100.05', ZERO_SIZE_STRING, 100.05],
    ['100.04', ZERO_SIZE_STRING, 100.04],
    ['100.03', '5.0030', 100.03],
    ['100.02', ZERO_SIZE_STRING, 100.02],
    ['100.01', '2.1345', 100.01],
    ['100.00', ZERO_SIZE_STRING, 100.0],
    ['99.99', ZERO_SIZE_STRING, 99.99],
  ];

  describe('#adjustBidsForAskMismatch', () => {
    const bidsExceedingLowestAskMock = [
      ['100.03', '5.0030', 100.03],
      ['100.02', '3.0000', 100.02],
      ['100.01', '2.1345', 100.01],
      ['100.00', '1.0000', 100.0],
      ['99.99', '1.0000', 99.99],
    ];

    const result = [
      ['100.01', '2.1345', 100.01],
      ['100.00', '1.0000', 100.0],
      ['99.99', '1.0000', 99.99],
    ];
    /*
    it('should remove bids that exceed lowest ask price', () => {
      const bids = [...bidsExceedingLowestAskMock];
      const lowestAskPrice = '100.02';
      expect(adjustBidsForAskMismatch(bids, lowestAskPrice, { priceDecimals: 2 })).toEqual(result);
    });
    */
    it('should not remove any bids if highest bid does not exceed lowest ask', () => {
      const bids = [...bidsExceedingLowestAskMock];
      const lowestAskPrice = '100.04';
      expect(adjustBidsForAskMismatch(bids, lowestAskPrice, { priceDecimals: 2 })).toEqual(bids);
    });
  });

  describe('#handleMissingLevelEdgeCases', () => {
    it('should return the input if both asks and bids have non-zero length and lowest ask is highest than highest bid (adjustBidsForAskMismatch makes no adjustments)', () => {
      const data = eliminateSpreadZeros({
        bids: [...bidsMock],
        asks: [...asksMock],
      });
      expect(handleMissingLevelEdgeCases(data, 2)).toEqual(data);
    });

    it('should return data with one zero-size ask level with price one tick above highest bid price if bids have non-zero length and asks have zero length', () => {
      const data = eliminateSpreadZeros({
        bids: [...bidsMock],
        asks: [],
      });
      const expectedAskLevelAdded = ['99.97', ZERO_SIZE_STRING, 99.97];
      const result = {
        bids: eliminateSpreadZerosBids([...bidsMock]),
        asks: [expectedAskLevelAdded],
      };
      expect(handleMissingLevelEdgeCases(data, 2)).toEqual(result);
    });

    it('should return data with one zero-size bid level with price one tick below lowest ask price if asks have non-zero length and bids have zero length', () => {
      const data = eliminateSpreadZeros({
        bids: [],
        asks: [...asksMock],
      });
      const expectedBidLevelAdded = ['100.00', ZERO_SIZE_STRING, 100];
      const result = {
        bids: [expectedBidLevelAdded],
        asks: eliminateSpreadZerosAsks([...asksMock]),
      };
      expect(handleMissingLevelEdgeCases(data, 2)).toEqual(result);
    });

    it('should return original input if both asks and bids have zero length', () => {
      const data = { bids: [], asks: [] };
      expect(handleMissingLevelEdgeCases(data, 2)).toEqual(data);
    });
  });

  describe('#eliminateSpreadZeros methods', () => {
    const eliminateSpreadZerosBidsResult = [
      ['99.96', '5.0030', 99.96],
      ['99.95', ZERO_SIZE_STRING, 99.95],
      ['99.94', '2.1345', 99.94],
      ['99.93', ZERO_SIZE_STRING, 99.93],
      ['99.92', ZERO_SIZE_STRING, 99.92],
    ];

    const eliminateSpreadZerosAsksResult = [
      ['100.05', ZERO_SIZE_STRING, 100.05],
      ['100.04', ZERO_SIZE_STRING, 100.04],
      ['100.03', '5.0030', 100.03],
      ['100.02', ZERO_SIZE_STRING, 100.02],
      ['100.01', '2.1345', 100.01],
    ];

    describe('#eliminateSpreadZerosBids', () => {
      it('should return bids with no leading zero values', () => {
        const bids = [...bidsMock];
        expect(eliminateSpreadZerosBids(bids)).toEqual(eliminateSpreadZerosBidsResult);
      });

      it('should return an empty array if there is no non-zero size bid', () => {
        const bids = [
          ['99.98', ZERO_SIZE_STRING, 99.98],
          ['99.97', ZERO_SIZE_STRING, 99.97],
        ];
        expect(eliminateSpreadZerosBids(bids)).toEqual([]);
      });
    });

    describe('#eliminateSpreadZerosAsks', () => {
      it('should return asks with no trailing zero values', () => {
        const asks = [...asksMock];
        expect(eliminateSpreadZerosAsks(asks)).toEqual(eliminateSpreadZerosAsksResult);
      });

      it('should return an empty array if there is no non-zero size ask', () => {
        const asks = [
          ['100.05', ZERO_SIZE_STRING, 100.05],
          ['100.04', ZERO_SIZE_STRING, 100.04],
        ];
        expect(eliminateSpreadZerosAsks(asks)).toEqual([]);
      });
    });

    describe('#eliminateSpreadZeros', () => {
      it('should return an object with asks and bids with outputs from eliminateSpreadZerosAsks and eliminateSpreadZerosBids', () => {
        const data = {
          bids: [...bidsMock],
          asks: [...asksMock],
        };
        expect(eliminateSpreadZeros(data)).toEqual({
          bids: eliminateSpreadZerosBidsResult,
          asks: eliminateSpreadZerosAsksResult,
        });
      });
    });
  });

  describe('#aggregateBidLevels', () => {
    it('should aggregate bids by 0.10 aggregation level and return 7 levels', () => {
      const bids = [
        ['99.98', '1.0000', 99.98],
        ['99.97', '5.0030', 99.97],
        ['99.87', '1.0000', 99.87],
        ['99.40', '1.0000', 99.4],
      ];

      const result = [
        ['99.90', '6.0030', 99.9],
        ['99.80', '1.0000', 99.8],
        ['99.70', ZERO_SIZE_STRING, 99.7],
        ['99.60', ZERO_SIZE_STRING, 99.6],
        ['99.50', ZERO_SIZE_STRING, 99.5],
        ['99.40', '1.0000', 99.4],
        ['99.30', ZERO_SIZE_STRING, 99.3],
      ];

      expect(
        aggregateBidLevels(bids, { aggregation: 0.1, levelsPerSide: 7, priceDecimals: 2 })
      ).toEqual(result);
    });

    it('should return an empty array if there is no bids', () => {
      const bids = [];
      expect(
        aggregateBidLevels(bids, { aggregation: 0.1, levelsPerSide: 7, priceDecimals: 2 })
      ).toEqual([]);
    });
  });

  describe('#aggregateAskLevels', () => {
    it('should aggregate asks by 0.10 aggregation level and return 7 levels', () => {
      const asks = [
        ['99.98', '1.0000', 99.98],
        ['99.97', '5.0030', 99.97],
        ['99.87', '1.0000', 99.87],
        ['99.40', '1.0000', 99.4],
      ];

      const result = [
        ['100.00', '6.0030', 100],
        ['99.90', '1.0000', 99.9],
        ['99.80', ZERO_SIZE_STRING, 99.8],
        ['99.70', ZERO_SIZE_STRING, 99.7],
        ['99.60', ZERO_SIZE_STRING, 99.6],
        ['99.50', ZERO_SIZE_STRING, 99.5],
        ['99.40', '1.0000', 99.4],
      ];

      expect(
        aggregateAskLevels(asks, { aggregation: 0.1, levelsPerSide: 7, priceDecimals: 2 })
      ).toEqual(result);
    });

    it('should return an empty array if there is no asks', () => {
      const asks = [];
      expect(
        aggregateAskLevels(asks, { aggregation: 0.1, levelsPerSide: 7, priceDecimals: 2 })
      ).toEqual([]);
    });
  });

  describe('#applyZeroSizeRules', () => {
    it('should return the expected output of eliminateSpreadZeros, handleMissingLevelEdgeCases, and insertMissingPriceLevels in that order', () => {
      const data = {
        bids: [...bidsMock],
        asks: [...asksMock],
      };
      const eliminateSpreadZeros_result = eliminateSpreadZeros({ ...data });
      const result = handleMissingLevelEdgeCases(eliminateSpreadZeros_result, 2);
      expect(applyZeroSizeRules(data, { priceDecimals: 2 })).toEqual(result);
    });
  });

  describe('#generateSpreadLevels', () => {
    const aggregatedAsks = [['3761.00', '816.1751', 3761]];
    let aggregatedBids = [['3760.00', '961.0777', 3760]];
    const aggregation = 0.5;
    const priceDecimals = 2;
    const levelsPerSide = 2;

    it('should return spread levels', () => {
      const result = [['3760.50', 0, 3760.5]];

      expect(
        generateSpreadLevels(
          aggregatedAsks,
          aggregatedBids,
          aggregation,
          priceDecimals,
          levelsPerSide
        )
      ).toEqual(result);
    });

    it('should return empty array if there is no lowestAsk', () => {
      const aggregatedAsks = [];

      expect(
        generateSpreadLevels(
          aggregatedAsks,
          aggregatedBids,
          aggregation,
          priceDecimals,
          levelsPerSide
        )
      ).toEqual([]);
    });

    it('should return empty array if there is no highestBid', () => {
      const aggregatedBids = [];

      expect(
        generateSpreadLevels(
          aggregatedAsks,
          aggregatedBids,
          aggregation,
          priceDecimals,
          levelsPerSide
        )
      ).toEqual([]);
    });

    it('should return empty array if delta is 0', () => {
      const aggregation = 1;

      expect(
        generateSpreadLevels(
          aggregatedAsks,
          aggregatedBids,
          aggregation,
          priceDecimals,
          levelsPerSide
        )
      ).toEqual([]);
    });

    it('should return centered spread levels if `levelsToInsert > maxVisible`', () => {
      aggregatedBids = [['3748.00', '961.0777', 3748]];

      const result = [
        ['3756.50', 0, 3756.5],
        ['3756.00', 0, 3756],
        ['3755.50', 0, 3755.5],
        ['3755.00', 0, 3755],
      ];

      expect(
        generateSpreadLevels(
          aggregatedAsks,
          aggregatedBids,
          aggregation,
          priceDecimals,
          levelsPerSide
        )
      ).toEqual(result);
    });
  });
});
