import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ChannelSubscription from '../../ws-subscription/containers/ChannelSubscription';
import { WS_CHANNELS } from '../../constants';

import NotificationTray from './components/NotificationTray';
import {
  selectFilteredNotifications,
  selectUnreadCount,
  selectVisible,
  updateVisibleAction,
  markNotificationsReadAction,
} from './ducks';

const mapStateToProps = state => ({
  visible: selectVisible(state),
  notifications: selectFilteredNotifications(state),
  unreadCount: selectUnreadCount(state),
});

const mapDispatchToProps = {
  markNotificationsRead: markNotificationsReadAction,
  updateVisible: updateVisibleAction,
};

const NotificationTrayContainer = ({
  notifications,
  markNotificationsRead,
  unreadCount,
  updateVisible,
  visible,
}) => (
  <ChannelSubscription channel={WS_CHANNELS.NOTIFICATIONS}>
    <NotificationTray
      notifications={notifications}
      markNotificationsRead={markNotificationsRead}
      unreadCount={unreadCount}
      updateVisible={updateVisible}
      visible={visible}
    />
  </ChannelSubscription>
);

NotificationTrayContainer.propTypes = {
  notifications: PropTypes.array.isRequired,
  markNotificationsRead: PropTypes.func.isRequired,
  updateVisible: PropTypes.func.isRequired,
  unreadCount: PropTypes.number.isRequired,
  visible: PropTypes.bool.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(NotificationTrayContainer);
