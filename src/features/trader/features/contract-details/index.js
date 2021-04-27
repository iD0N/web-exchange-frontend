import React, { Component } from 'react';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';
import BigNumber from 'bignumber.js';

// import { CONTRACT_TYPE } from '../../../../common/enums';
import { Spin } from '../../../../common/components';
import { CONTRACT_TYPE } from '../../../../common/enums';
import { Empty, Table, Value, PerfectScrollbar } from '../../../../common/components/trader';
import { fetchSummaryActions } from '../../../../features/dashboard/ducks';
import { GridLayoutTile, WidgetHeader } from '../../components';

import { selectContractDetails } from '../../data-store/ducks';

const columns = [
  { dataIndex: 'title', width: 60 },
  { dataIndex: 'value', align: 'right', width: 60 },
];

const rows = data =>
  Object.entries(data)
    .map(([key, { type, props, render }]) => {
      if (render && props.value) {
        return {
          title: <Trans i18nKey={`trader.contractDetails.rows.${key}`} />,
          value: render(),
          dataIndex: key,
        };
      }
      const ComponentName = Value[type];
      if (!props.value) {
        return null;
      }
      return {
        title: <Trans i18nKey={`trader.contractDetails.rows.${key}`} />,
        value: props.value ? <ComponentName {...props} /> : null,
        dataIndex: key,
      };
    })
    .filter(a => !!a)
    .concat({title: '', value: <></>, dataIndex: "empty"});

const typeToRows = {
  [CONTRACT_TYPE.SWAP]: ['ticker', 'indexPrice', 'markPrice', 'volume', 'openInterest', 'predictedRate', 'nextFundingTime'],
  [CONTRACT_TYPE.FUTURE]: ['ticker', 'indexPrice', 'markPrice', 'volume', 'openInterest', 'expiryTime', 'premium'],
  [CONTRACT_TYPE.SPOT]: ['ticker', 'baseCurrency', 'quoteCurrency', 'volume'],
  [CONTRACT_TYPE.FUTURE_SPREAD]: ['ticker', 'spreadContractCodeBack', 'spreadContractCodeFront', 'indexPrice', 'volume', 'expiryTime'],
  [CONTRACT_TYPE.DL_TOKEN]: ['ticker', 'underlying', 'indexPrice', 'volume', 'expiryTime'],
};

const underlyingToHref = {
  "BTC": "https://support.crypto.io/hc/en-us/articles/360053924734-BTC-Bitcoin-",
  "ETH": "https://support.crypto.io/hc/en-us/articles/360053927094-ETH-Ethereum-",
  "TECH100": "https://support.crypto.io/hc/en-us/articles/360053927454-TECH100-Technology-100-",
};

const mapStateToProps = state => {
  const {
    contractCode,
    expiryTime,
    indexPrice,
    markPrice,
    openInterest,
    priceDecimals,
    quoteCurrency,
    nextFundingTime,
    nextFundingRate,
    type,
    volume,
    underlying,
    sizeDecimals,
    spreadContractCodeBack,
    spreadContractCodeFront,
  } = selectContractDetails(state);

  let premium;
  if (type === CONTRACT_TYPE.FUTURE && markPrice && indexPrice && expiryTime) {
    const minUntilExpiry = Math.ceil((Date.parse(expiryTime) - Date.now()) / (1000 * 60));
    premium = BigNumber(markPrice)
      .dividedBy(indexPrice)
      .minus(1)
      .multipliedBy(525600)
      .dividedBy(minUntilExpiry)
      .toNumber();
  }

  const rowMap = {
    ticker: {
      render: () => underlyingToHref[underlying] ? <a href={underlyingToHref[underlying]} target="_blank">{contractCode}</a> : contractCode,
      props: {
        value: contractCode,
      },
    },
    spreadContractCodeBack: {
      render: () => spreadContractCodeBack,
      props: {
        value: spreadContractCodeBack,
      },
    },
    spreadContractCodeFront: {
      render: () => spreadContractCodeFront,
      props: {
        value: spreadContractCodeFront,
      },
    },
    indexPrice: {
      type: 'Numeric',
      props: {
        value: indexPrice,
        type: 'currency',
        decimals: priceDecimals,
        noPrefix: true,
      },
    },
    markPrice: {
      type: 'Numeric',
      props: {
        value: markPrice,
        type: 'currency',
        decimals: priceDecimals,
        noPrefix: true,
      },
    },
    openInterest: {
      type: 'Numeric',
      props: {
        value: openInterest,
        type: 'token',
        token: underlying,
        decimals: sizeDecimals,
      },
    },
    predictedRate: {
      type: 'Numeric',
      props: {
        type: 'percentage',
        value: nextFundingRate,
        decimals: 4,
      },
    },
    nextFundingTime: {
      type: 'Date',
      props: {
        value: nextFundingTime,
        type: 'time',
      },
    },
    volume: {
      type: 'Numeric',
      props: {
        value: volume,
        type: 'token',
        token: underlying,
        decimals: sizeDecimals,
      },
    },
    quoteCurrency: {
      render: () => quoteCurrency,
      props: {
        value: quoteCurrency
      },
    },
    baseCurrency: {
      render: () => underlying,
      props: {
        value: underlying,
      },
    },
    underlying: {
      render: () => underlying,
      props: {
        value: underlying,
      },
    },
    expiryTime: {
      type: 'Date',
      props: {
        value: expiryTime,
        type: 'datetimeUtc',
      },
    },
    premium: {
      type: 'Numeric',
      props: {
        type: 'percentage',
        value: premium,
        decimals: 4,
      },
    },
  };
  
  return {
    data: typeToRows[type].reduce(
      (acc, key) => ({...acc, [key]: rowMap[key] }), {}
    ),
    type,
  }
};

const mapActionsToProps = {
  fetchSummary: fetchSummaryActions.request,
};

let summaryPolling;

class ContractDetails extends Component {
  componentDidMount() {
    summaryPolling = setInterval(this.props.fetchSummary, 1000 * 65);
  }

  componentWillUnmount() {
    clearInterval(summaryPolling);
  }

  render() {
    const { data, type } = this.props;
    return (
      <div className="contract-details-wrapper">
        <GridLayoutTile
          title={
            <WidgetHeader
              title={type === CONTRACT_TYPE.SPOT
                ? <Trans i18nKey="trader.contractDetails.marketDetails">Market Details</Trans>
                : <Trans i18nKey="trader.contractDetails.title">Contract Details</Trans>
              }
            />
          }
          content={
            <PerfectScrollbar>
              <Spin spinning={!data}>
                {!!data ? (
                  <Table
                    rowHeight={30}
                    id="contract-details"
                    columns={columns}
                    dataSource={rows(data)}
                    rowKey="dataIndex"
                    showHeader={false}
                    isMobile
                  />
                ) : (
                  <Empty />
                )}
              </Spin>
            </PerfectScrollbar>
          }
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapActionsToProps)(ContractDetails);
