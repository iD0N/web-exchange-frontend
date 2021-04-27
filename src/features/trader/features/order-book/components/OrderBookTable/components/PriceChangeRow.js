import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { isProd } from '../../../../../../../config';
import { Icon } from '../../../../../../../common/components';
import { Value } from '../../../../../../../common/components/trader';
import { selectTickerData } from '../../../../../data-store/ducks';

const mapStateToProps = (state, { contractCode, isSpot, quoteCurrency }) => {
  const tickerData = selectTickerData(state);
  const contractTickerData = tickerData[contractCode] || {};
  if (isProd() && !isSpot) {
    return {
      direction: contractTickerData.markPriceDirection,
      lastPrice: contractTickerData.markPrice,
    };
  }

  return {
    direction: contractTickerData.fairPriceDirection,
    lastPrice: contractTickerData.fairPrice,
    usdPrice: contractTickerData.usdPrice,
  };
};

const PriceChangeRow = ({ direction, lastPrice, usdPrice }) => (
  <div className="order-book-last-trade-price">
    {!!direction && <Icon type={`caret-${direction}`} />} {lastPrice}{' '}
    {usdPrice ? (
      <>
        (<Value.Numeric type="currency" decimals={2} prefix="$" value={usdPrice} />)
      </>
    ) : null}
  </div>
);

PriceChangeRow.propTypes = {
  direction: PropTypes.string,
  lastPrice: PropTypes.string,
};

PriceChangeRow.defaultProps = {
  direction: '',
  lastPrice: '',
};

export default memo(connect(mapStateToProps)(PriceChangeRow));
