import { connect } from 'react-redux';

import { logEventAction } from '../../../../common/services/eventLogger';
import { selectIsLoggedIn } from '../../../../common/services/user';
import { ConnectOrderEntryContext } from '../order-entry/OrderEntryContext';

import {
  cancelOrdersByIdsAction,
  cancelOrdersBySideAction,
  cancelOrdersInLevelAction,
  closePositionAction,
  updateOrderLevelAction,
  updateOrderPriceInLevelAction,
} from './ducks';
import TradeModeProvider from './Context';

const mapStateToProps = state => ({
  isLoggedIn: selectIsLoggedIn(state),
});

const mapDispatchToProps = {
  cancelOrdersByIds: cancelOrdersByIdsAction,
  cancelOrdersInLevel: cancelOrdersInLevelAction,
  updateOrderLevel: updateOrderLevelAction,
  updateOrderPriceInLevel: updateOrderPriceInLevelAction,
  cancelOrdersBySide: cancelOrdersBySideAction,
  closePosition: closePositionAction,
  logEvent: logEventAction,
};

export default ConnectOrderEntryContext(
  connect(mapStateToProps, mapDispatchToProps)(TradeModeProvider)
);
