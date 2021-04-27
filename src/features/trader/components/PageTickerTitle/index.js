import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import DocumentTitle from 'react-document-title';

import { isProd } from '../../../../config';
import { CONTRACT_TYPE, DIRECTION } from '../../../../common/enums';
import { toPriceString } from '../../../../common/utils/numberHelpers';
import { selectTickerData, selectGlobalContract } from '../../data-store/ducks';

const UP_ARROW = '▲';
const DOWN_ARROW = '▼';

const mapStateToProps = state => {
  const tickerData = selectTickerData(state);
  const globalContract = selectGlobalContract(state);
  const { contractCode, type } = globalContract;
  const isSpot = type === CONTRACT_TYPE.SPOT;
  const contractTickerData = tickerData[contractCode] || {};
  return {
    direction:
      !isProd() || isSpot
        ? contractTickerData.fairPriceDirection
        : contractTickerData.markPriceDirection,
    lastPrice: isSpot ? contractTickerData.fairPrice : contractTickerData.markPrice,
    globalContract,
  };
};

class PriceTitle extends PureComponent {
  static propTypes = {
    direction: PropTypes.string,
    lastPrice: PropTypes.string,
    globalContract: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
  };

  static defaultProps = {
    lastPrice: '',
    direction: '',
  };

  componentWillUnmount() {
    if (!!window && !!window.document && !!window.document.title) {
      window.document.title = this.props.t('title');
    }
  }

  render() {
    const {
      globalContract: { contractCode, priceDecimals, quoteCurrency },
      direction,
      lastPrice: price,
    } = this.props;

    const priceUnavailable = !price || price === 'NaN';

    return (
      <DocumentTitle
        title={[
          'Crypto |',
          ...(!priceUnavailable && direction
            ? [direction === DIRECTION.UP ? UP_ARROW : DOWN_ARROW]
            : []),
          ...(!priceUnavailable
            ? [`${quoteCurrency === 'USD' ? '$' : ''}${toPriceString(price, priceDecimals)}`]
            : []),
          !priceUnavailable ? `(${contractCode})` : contractCode,
        ].join(' ')}
      />
    );
  }
}

export default connect(mapStateToProps)(translate()(PriceTitle));
