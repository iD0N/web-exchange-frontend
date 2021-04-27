import React from 'react';
import PropTypes from 'prop-types';

import Empty from './components/Empty';
import NotificationItem from './components/NotificationItem';

const NotificationTrayOverlay = ({ notifications, visible }) =>
  notifications.length ? (
    <div className="notification-wrapper-outer-outer">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.notificationId}
          notification={notification}
          visible={visible}
        />
      ))}
    </div>
  ) : (
    <Empty />
  );

NotificationTrayOverlay.propTypes = {
  notifications: PropTypes.array.isRequired,
  visible: PropTypes.bool.isRequired,
};

export default NotificationTrayOverlay;
