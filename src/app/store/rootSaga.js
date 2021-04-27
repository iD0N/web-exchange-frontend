import { all, fork } from 'redux-saga/effects';

import { eventLoggerSaga } from '../../common/services/eventLogger';
import { accountsSaga } from '../../common/services/accounts';
import { webSocketSaga } from '../../common/services/webSocket';
import { userSaga } from '../../common/services/user';
import { keyValueStoreSaga } from '../../common/services/keyValueStore';
import { authSaga } from '../../features/auth/ducks';
import { fieldsSaga } from '../../features/account/fields/ducks';
import { identitySaga } from '../../features/account/identity/ducks';
import { profileSaga } from '../../features/settings/components/account/ducks';
import { chartSaga } from '../../features/trader/features/tradingview/ducks';
import { transfersSaga } from '../../features/settings/components/transfers/ducks';
import { historySaga } from '../../features/settings/components/history/ducks';
import { leaderboardSaga } from '../../features/competitions/ducks';
import { competitionsSaga } from '../../features/settings/components/competitions/ducks';
import { notificationsSaga } from '../../features/trader/features/notification-tray/ducks';
import { orderEntrySaga } from '../../features/trader/features/order-entry/ducks';
import { orderBookSaga } from '../../features/trader/features/order-book/ducks';
import { ordersSaga } from '../../features/trader/features/orders/ducks';
import { traderDataStoreSaga } from '../../features/trader/data-store/ducks';
import { positionsSaga } from '../../features/trader/features/positions/ducks';
import { timeAndSalesSaga } from '../../features/trader/features/time-and-sales/ducks';
import { apiKeysSaga } from '../../features/settings/components/api/ducks';
import { layoutManagerSaga } from '../../features/trader/layout-manager/ducks';
import { traderWebSocketSaga } from '../../features/trader/ws-subscription/ducks';
import { tradeModeSaga } from '../../features/trader/features/trade-mode/ducks';
import { dashboardSaga } from '../../features/dashboard/ducks';

export default function* rootSaga() {
  yield all([
    fork(eventLoggerSaga),
    fork(accountsSaga),
    fork(webSocketSaga),
    fork(userSaga),
    fork(keyValueStoreSaga),
    fork(authSaga),
    fork(fieldsSaga),
    fork(identitySaga),
    fork(profileSaga),
    fork(traderWebSocketSaga),
    fork(traderDataStoreSaga),
    fork(chartSaga),
    fork(transfersSaga),
    fork(historySaga),
    fork(leaderboardSaga),
    fork(competitionsSaga),
    fork(notificationsSaga),
    fork(orderEntrySaga),
    fork(orderBookSaga),
    fork(ordersSaga),
    fork(positionsSaga),
    fork(timeAndSalesSaga),
    fork(apiKeysSaga),
    fork(layoutManagerSaga),
    fork(tradeModeSaga),
    fork(dashboardSaga),
  ]);
}
