import { ZERO_SIZE_STRING } from '../../../constants';

import { insertAllChangesAsLevels, updateOrInsertAsks, updateOrInsertBids } from './updateBook';

const levelsMock = [
  ['100.04', ZERO_SIZE_STRING, 100.04],
  ['100.03', '5.0030', 100.03],
  ['100.01', '2.1345', 100.01],
  ['100.00', ZERO_SIZE_STRING, 100.0],
];

describe('features/trader/features/order-book/utils/updateBook.js', () => {
  describe('#insertAllChangesAsLevels', () => {
    it('return the level array sorted in descending order', () => {
      const changesMock = [
        ['bid', '99.88', '99.99'],
        ['ask', '99.90', '100.01'],
        ['ask', '99.89', '100.00'],
        ['bid', '99.87', '99.98'],
      ];
      const changesResult = [
        ['ask', '99.90', '100.01'],
        ['ask', '99.89', '100.00'],
        ['bid', '99.88', '99.99'],
        ['bid', '99.87', '99.98'],
      ];
      expect(insertAllChangesAsLevels(changesMock)).toEqual(changesResult);
    });
  });

  describe('#updateOrInsert levels', () => {
    const inserts = [
      ['100.05', '40.00', 100.05],
      ['100.02', '8.0', 100.02],
      ['99.99', '100.00', 99.99],
    ];
    const updates = [
      ['100.04', '7.00', 100.04],
      ['100.03', ZERO_SIZE_STRING, 100.03],
      ['100.01', ZERO_SIZE_STRING, 100.01],
      ['100.00', '99.99', 100.0],
    ];
    const resultInserts = [
      ['100.05', '40.00', 100.05],
      ['100.04', ZERO_SIZE_STRING, 100.04],
      ['100.03', '5.0030', 100.03],
      ['100.02', '8.0', 100.02],
      ['100.01', '2.1345', 100.01],
      ['100.00', ZERO_SIZE_STRING, 100.0],
      ['99.99', '100.00', 99.99],
    ];
    const resultUpdates = [
      ['100.04', '7.00', 100.04],
      ['100.03', ZERO_SIZE_STRING, 100.03],
      ['100.01', ZERO_SIZE_STRING, 100.01],
      ['100.00', '99.99', 100.0],
    ];
    const insertsAndUpdates = [...inserts, ...updates];
    const resultInsertAndUpdates = [
      ['100.05', '40.00', 100.05],
      ['100.04', '7.00', 100.04],
      ['100.03', ZERO_SIZE_STRING, 100.03],
      ['100.02', '8.0', 100.02],
      ['100.01', ZERO_SIZE_STRING, 100.01],
      ['100.00', '99.99', 100.0],
      ['99.99', '100.00', 99.99],
    ];

    describe('#updateOrInsertAsks', () => {
      it('should insert new asks', () => {
        expect(updateOrInsertAsks([...inserts], [...levelsMock])).toEqual(resultInserts);
      });

      it('should update existing asks', () => {
        expect(updateOrInsertAsks([...updates], [...levelsMock])).toEqual(resultUpdates);
      });

      it('should update existing asks and insert new asks', () => {
        expect(updateOrInsertAsks([...insertsAndUpdates], [...levelsMock])).toEqual(
          resultInsertAndUpdates
        );
      });
    });

    describe('#updateOrInsertBids', () => {
      it('should insert new asks', () => {
        expect(updateOrInsertBids([...inserts], [...levelsMock])).toEqual(resultInserts);
      });

      it('should update existing asks', () => {
        expect(updateOrInsertBids([...updates], [...levelsMock])).toEqual(resultUpdates);
      });

      it('should update existing bids and insert new bids', () => {
        expect(updateOrInsertBids([...insertsAndUpdates], [...levelsMock])).toEqual(
          resultInsertAndUpdates
        );
      });
    });
  });
});
