import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import NotificationService from '../../../../../../common/services/notification';
import { Icon } from '../../../../../../common/components';
import { Dropdown } from '../../../../../../common/components/trader';

import NotificationTrayOverlay from '../NotificationTrayOverlay';

const align = { offset: [0, 0] };

export default class NotificationTray extends Component {
  static propTypes = {
    notifications: PropTypes.array.isRequired,
    markNotificationsRead: PropTypes.func.isRequired,
    unreadCount: PropTypes.number.isRequired,
    updateVisible: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
  };

  handleVisibleUpdate = visible => {
    this.props.updateVisible(visible);

    if (visible) {
      NotificationService.destroy();
    } else {
      const notificationIds = this.props.notifications.reduce(
        (arr, { notificationId, read }) => (!read ? [...arr, notificationId] : arr),
        []
      );
      if (notificationIds.length) {
        this.props.markNotificationsRead(notificationIds);
      }
    }
  };

  render() {
    const { notifications, unreadCount, visible } = this.props;

    return (
      <Dropdown
        align={align}
        fullHeight
        hoverTrigger
        overlayClassName={cn('notification-tray-overlay', {
          'notification-tray-overlay-empty': notifications.length === 0,
        })}
        triggerClassName="notification-tray-trigger"
        overlay={<NotificationTrayOverlay notifications={notifications} visible={visible} />}
        visible={visible}
        onVisibleChange={this.handleVisibleUpdate}
      >
        <>
          <Icon type="bell" />
          {unreadCount > 0 ? <div className="badge">{unreadCount}</div> : null}
        </>
      </Dropdown>
    );
  }
}
