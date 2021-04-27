import { fireEvent } from 'react-testing-library';
import configureStore from 'redux-mock-store';

import { wrapComponent } from '../../../../../test/utils';
import { CONTRACT_TYPE, ORDER_STOP_TRIGGER } from '../../../../../common/enums';
import currentContract from '../../../../../common/utils/currentContract';
import { SIZE_TYPE } from '../../../features/order-entry/constants';

import OrderForm from './';

const renderComponent = wrapComponent(OrderForm);

describe('features/trader/components/order/OrderForm', () => {
  const mockStore = configureStore();
  let store;

  const props = {
    orderType: {
      value: 'market',
    },
    postOnly: {
      value: false,
    },
    price: {
      value: 3.35,
    },
    notional: {
      value: undefined,
    },
    reduceOnly: {
      value: false,
    },
    size: {
      value: '4',
    },
    sizeType: {
      value: SIZE_TYPE.QUANTITY,
    },
    stopTrigger: {
      value: ORDER_STOP_TRIGGER.MARK,
    },
    onCloseClick: jest.fn(),
    onSubmit: jest.fn(),
    onChange: jest.fn(),
    onSizeChange: jest.fn(),
    onNotionalSizeChange: jest.fn(),
    contract: {
      contractCode: currentContract('BTC'),
      underlying: 'BTC',
      liquidationInitialRatio: 0.5,
      maintenanceInitialRatio: 0.75,
      initialMarginPerContract: 0,
      initialMarginBase: 0.005,
      liquidationMargin: 1000,
      minimumQuantity: '0.0001',
      minimumPriceIncrement: '0.5',
      priceDecimals: 2,
      quantityStep: '1.0000',
      sizeDecimals: 4,
      markPrice: 10000,
      type: CONTRACT_TYPE.SWAP,
    },
    maxBuySellDisabled: true,
    buttonsNotRendered: true,
    store: mockStore,
  };

  const initialStore = {
    orderBook: {
      data: { asks: [], bids: [] },
    },
    orders: {
      openOrders: [],
      orderHistory: [],
      orderFills: [],
    },
    positions: {
      list: [],
      loaded: true,
    },
    traderDataStore: {
      tokenBalances: {
        byId: { btc: '1.000000' },
        loaded: true,
      },
      contracts: [
        {
          contractCode: currentContract('BTC'),
          priceBandThresholdMarket: '0.06',
        },
      ],
      collateralPrices: {
        BTC: 3.5,
      },
      tokens: [
        {
          tokenCode: 'BTC',
          isCollateral: true,
          isTransferable: true,
          decimalPlaces: 8,
          indexCode: '.BTCUSD',
        },
      ],
      globalContractCode: currentContract('BTC'),
      tickerData: {
        BTC: 3.5,
      },
    },
  };

  beforeEach(() => {
    store = mockStore(initialStore);
  });

  describe('when orderType is market', () => {
    it('should not render price', () => {
      const { queryByText } = renderComponent({ ...props, orderType: { value: 'market' } }, store);

      expect(queryByText('Price')).not.toBeInTheDocument();
    });
  });

  describe('when orderType is limit', () => {
    it('should render price', () => {
      const { queryByText } = renderComponent({ ...props, orderType: { value: 'limit' } }, store);

      expect(queryByText('Price')).toBeInTheDocument();
    });
  });
});
