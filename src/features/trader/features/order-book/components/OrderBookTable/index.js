import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { CONTRACT_TYPE } from '../../../../../../common/enums';
import { Empty } from '../../../../../../common/components/trader';
import { OrderEntryConsumer } from '../../../order-entry/OrderEntryContext';

import { selectOrderBookLevels, selectOrderBookIsEmpty } from '../../ducks';
import { LEVEL_SIDES } from '../../utils/constants';
import Levels from './components/Levels';
import PriceChangeRow from './components/PriceChangeRow';

const mapStateToProps = state => ({
  levels: selectOrderBookLevels(state),
  orderBookIsEmpty: selectOrderBookIsEmpty(state),
});

const OrderBookTable = ({ levels, orderBookIsEmpty }) =>
  orderBookIsEmpty ? (
    <Empty />
  ) : (
    <OrderEntryConsumer>
      {({
        globalContract: { contractCode, quoteCurrency, type, underlying },
        sizeType: { value: sizeType },
      }) =>
        !!quoteCurrency && (
          <>
            <Levels
              dataSource={levels.asks}
              levelSide={LEVEL_SIDES.ASK}
              quoteCurrency={quoteCurrency}
              showHeader
              sizeType={sizeType}
              underlying={underlying}
            />
            <PriceChangeRow
              contractCode={contractCode}
              quoteCurrency={quoteCurrency}
              isSpot={type === CONTRACT_TYPE.SPOT}
            />
            <Levels
              dataSource={levels.bids}
              levelSide={LEVEL_SIDES.BID}
              quoteCurrency={quoteCurrency}
              sizeType={sizeType}
              underlying={underlying}
            />
          </>
        )
      }
    </OrderEntryConsumer>
  );

OrderBookTable.propTypes = {
  levels: PropTypes.object.isRequired,
  orderBookIsEmpty: PropTypes.bool.isRequired,
};

export default connect(mapStateToProps)(OrderBookTable);
