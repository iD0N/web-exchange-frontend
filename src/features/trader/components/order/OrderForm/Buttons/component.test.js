import { fireEvent } from 'react-testing-library';
import configureStore from 'redux-mock-store';

import { wrapComponent } from '../../../../../../test/utils';
import { CONTRACT_TYPE } from '../../../../../../common/enums';
import currentContract from '../../../../../../common/utils/currentContract';
import { SIZE_TYPE } from '../../../../features/order-entry/constants';

import Buttons from './component';

const renderComponent = wrapComponent(Buttons);

describe('features/trader/components/order/OrderForm/Buttons/component', () => {
  const mockStore = configureStore();
  let store;

  const props = {
    contractCode: currentContract('BTC'),
    disableBuy: false,
    disableSell: false,
    hasErrors: false,
    handleSubmit: jest.fn(),
    isModify: false,
    isMobile: false,
    orderType: 'limit',
    price: 3.35,
    notional: undefined,
    size: '4',
    sizeType: SIZE_TYPE.QUANTITY,
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
        byId: { btc: '10.000000' },
        loaded: true,
      },
      contracts: [
        {
          contractCode: currentContract('BTC'),
          priceBandThresholdMarket: '0.06',
          liquidationInitialRatio: 0.5,
          maintenanceInitialRatio: 0.75,
          liquidationMargin: 1000,
          initialMarginPerContract: 0,
          initialMarginBase: 0.005,
          sizeDecimals: 4,
          markPrice: 10000,
          underlying: 'BTC',
          type: CONTRACT_TYPE.SWAP,
          priceDecimals: 2,
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
        [currentContract('BTC')]: {
          lastTradePrice: '7500.00',
        },
      },
    },
  };

  beforeEach(() => {
    store = mockStore(initialStore);
  });

  describe('when quantity (size.value) is non-zero', () => {
    it('should allow submit (sell)', () => {
      const { queryByText } = renderComponent({ ...props, side: { value: 'sell' } }, store);

      const sellButton = queryByText('sell');

      expect(sellButton).not.toHaveAttribute('disabled');
      fireEvent.click(sellButton);
      expect(props.handleSubmit).toHaveBeenCalled();
    });

    it('should allow submit (buy)', () => {
      const { queryByText } = renderComponent(props, store);

      const buyButton = queryByText('buy');

      expect(buyButton).not.toHaveAttribute('disabled');
      fireEvent.click(buyButton);
      expect(props.handleSubmit).toHaveBeenCalled();
    });
  });
});
