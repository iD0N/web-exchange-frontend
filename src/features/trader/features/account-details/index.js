import React, { Component } from 'react';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';

import { CONTRACT_TYPE } from '../../../../common/enums';
import { connectSpinner } from '../../../../common/services/spinner';
import { apiCallIds } from '../../../../common/services/user/api';
import { selectAccountTraderId } from  '../../../../common/services/accounts';
import { selectMaxLeverage, getMaxLeverageActions, setMaxLeverageActions } from '../../../../common/services/user';
import { Spin } from '../../../../common/components';
import { Empty, Slider, Table, Tooltip, Value, PerfectScrollbar } from '../../../../common/components/trader';
import { GridLayoutTile, WidgetHeader } from '../../components';
import { selectGlobalContract } from '../../data-store/ducks';

import { selectAccountSummaryData, selectEffectiveLeverage } from '../account-summary/ducks';
import { selectOpenOrderCount } from '../orders/ducks';
import { selectOpenPositionsCount } from '../positions/ducks';

const columns = [
  { dataIndex: 'title', width: 40 },
  { dataIndex: 'value', align: 'right', width: 60 },
];
const ticks = [1,3,5,10,20,50,100];
const findValueIndex = value => ticks.findIndex(a => a === value);
const marks = ticks.reduce((acc, val, index) => ({...acc, [index]: {
  label: `${ticks[index]}x`,
}}), {});

const rows = data =>
  Object.entries(data)
    .map(([key, { type, props, render }]) => {
      if (render && props.value) {
        return {
          title: <Trans i18nKey={`trader.accountDetails.rows.${key}`} />,
          value: render(),
          dataIndex: key,
        };
      }
      if (!props.value) {
        return null;
      }
      const ComponentName = Value[type];
      return {
        title: <Trans i18nKey={`trader.accountDetails.rows.${key}`} />,
        value: <ComponentName {...props} />,
        dataIndex: key,
      };
    })
    .filter(a => !!a);

const mapStateToProps = state => {
  const accountSummaryData = selectAccountSummaryData(state);
  if (!accountSummaryData.marginBarValues || !accountSummaryData.marginBarValues.dataReady) {
    return { data: {}, traderId: selectAccountTraderId(state) }
  };
  const {
    balances: { netLiquidationValue, buyingPower, initialMargin },
    marginBarValues: { dataReady },
  } = accountSummaryData;

  const effectiveLeverage = selectEffectiveLeverage(state);
  const maxLeverage = selectMaxLeverage(state);

  const openOrdersCount = selectOpenOrderCount(state);
  const openPositionsCount = selectOpenPositionsCount(state);

  return {
    maxLeverage,
    effectiveLeverage,
    canSetLeverage: openOrdersCount === 0 && openPositionsCount === 0,
    traderId: selectAccountTraderId(state),
    isSpotContract: selectGlobalContract(state).type === CONTRACT_TYPE.SPOT,
    data: {
      totalCollateral: {
        type: 'Numeric',
        props: {
          value: dataReady ? netLiquidationValue : undefined,
          type: 'currency',
          decimals: 2,
        },
      },
      availableCollateral: {
        type: 'Numeric',
        props: {
          value: dataReady ? buyingPower : undefined,
          type: 'currency',
          decimals: 2,
        },
      },
      effectiveLeverage: {
        render: () => effectiveLeverage && `${effectiveLeverage}x`,
        props: {
          value: effectiveLeverage,
        },
      },
      maximumLeverage: {
        render: () => maxLeverage && `${maxLeverage}x`,
        props: {
          value: maxLeverage,
        },
      },
      initialMargin: {
        type: 'Numeric',
        props: {
          value: dataReady ? initialMargin : undefined,
          type: 'currency',
          decimals: 2,
        },
      },
      /*
      marginRatio: {
        type: 'Numeric',
        props: {
          type: 'percentage',
          value: marginRatio,
          decimals: 4,
        },
      },
      maintenanceMarginRatio: {
        type: 'Numeric',
        props: {
          type: 'percentage',
          value: maintenanceMarginRatio,
          decimals: 4,
        },
      },
      */
    },
  };
};

const mapDispatchToProps = {
  getMaxLeverage: getMaxLeverageActions.request,
  setMaxLeverage: setMaxLeverageActions.request,
};

class ContractDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      maxLeverage: props.maxLeverage,
      maxLeverageTick: props.maxLeverage ? findValueIndex(props.maxLeverage) : 4,
    }
  };

  componentDidMount() {
    if (!!this.props.traderId) {
      this.props.getMaxLeverage();
    }
  };

  componentDidUpdate({ maxLeverage: prevMaxLeverage, traderId: prevTraderId }) {
    const { maxLeverage, traderId } = this.props;
    if (maxLeverage !== prevMaxLeverage) {
      this.setState({
        maxLeverage: maxLeverage,
        maxLeverageTick: findValueIndex(maxLeverage),
      });
    }
    if (!prevTraderId && !!traderId) {
      this.props.getMaxLeverage();
    }
  }

  renderSlider = () => {
    const { isSetting, canSetLeverage, setMaxLeverage } = this.props;
    const { maxLeverage, maxLeverageTick } = this.state;

    return (
     <span className="account-details-leverage-wrapper">
        <Spin spinning={isSetting || !canSetLeverage}>
          <Slider marks={marks}
            step={null}
            value={maxLeverageTick}
            max={ticks.length-1}
            onChange={maxLeverageTick => this.setState({ maxLeverageTick })}
            onAfterChange={val => {
              if (val === findValueIndex(maxLeverage)) {
                return;
              }
              setMaxLeverage(ticks[val])
            }}
            tipFormatter={val => `${ticks[val]}x`} />
        </Spin>
      </span>
    );
  }

  render () {
    const { canSetLeverage, data, isGetting, isSpotContract } = this.props;
    const { maxLeverage } = this.state;

    return (
      <div className="account-details-wrapper">
        <GridLayoutTile
          requiresAuth
          title={<WidgetHeader title={<Trans i18nKey="trader.accountDetails.title">Account</Trans>} />}
          content={
            <PerfectScrollbar>
              <Spin spinning={!data}>
                {!!data ? (
                  <Table
                    id="contract-details"
                    columns={columns}
                    dataSource={rows(data)}
                    rowHeight={30}
                    rowKey="dataIndex"
                    showHeader={false}
                    isMobile
                  />
                ) : (
                  <Empty />
                )}
                {!isSpotContract && !!data && !!maxLeverage && !isGetting && (
                  <h2>
                    <Trans i18nKey="trader.accountDetails.maxLeverage">Max Account Leverage</Trans>
                  </h2>
                )}
                {!isSpotContract && !!data && !!maxLeverage && !isGetting && (canSetLeverage
                  ? this.renderSlider()
                  : <Tooltip
                      placement="topRight"
                      title={<Trans i18nKey="trader.accountDetails.disabledMaxLeverageTooltip">
                        Max Account Leverage can only be adjusted when there are no open positions or orders
                      </Trans>}>
                      {this.renderSlider()}
                    </Tooltip>
                 )}
              </Spin>
            </PerfectScrollbar>
          }
        />
      </div>
    );
  }
};

export default connectSpinner({
  isGetting: apiCallIds.GET_MAX_LEVERAGE,
  isSetting: apiCallIds.SET_MAX_LEVERAGE,
})(connect(mapStateToProps, mapDispatchToProps)(ContractDetails));
