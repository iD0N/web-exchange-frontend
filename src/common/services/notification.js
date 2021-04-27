import React, { Component } from 'react';
import notification from 'antd/lib/notification';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Notification from 'react-web-notification';
import { isMobile } from 'react-device-detect';

import { Icon } from '../components';
import { selectRootUrl } from '../../config';
import { createActionCreator } from '../utils/reduxHelpers';

const icon = `${selectRootUrl()}/assets/apple-touch-icon.png`;

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  SUCCESS: 'success',
  LOADING: 'loading',
};

const typeIcon = {
  [NOTIFICATION_TYPES.INFO]: 'info-circle',
  [NOTIFICATION_TYPES.WARN]: 'exclamation-circle',
  [NOTIFICATION_TYPES.SUCCESS]: 'check-circle',
  [NOTIFICATION_TYPES.ERROR]: 'close-circle',
};

let supported = false;
if ('Notification' in window && window.Notification) {
  try {
    new window.Notification('');
    supported = true;
  } catch (e) {
    if (e.name === 'TypeError') {
      supported = false;
    }
  }
}

const hasBrowserNotificationPermission = () =>
  supported && !isMobile && !!window.Notification && window.Notification.permission === 'granted';

const createNotificationMethod = type => ({
  subject,
  body,
  duration,
  forceAppNotif,
  onClick,
  onClose,
}) =>
  notification.open({
    message: subject,
    description: (
      <>
        {supported && !isMobile && !!window.Notification && (
          <Notification
            title={subject}
            options={{ body, icon }}
            onClick={() => window.focus()}
            swRegistration={{}}
          />
        )}
        <span onClick={onClick}>{body}</span>
      </>
    ),
    icon: <Icon type={typeIcon[type]} />,
    onClose,
    className: !forceAppNotif && hasBrowserNotificationPermission() ? 'displayNone' : undefined,
    duration,
  });

const mapDispatchToProps = {
  batchMarkRead: createActionCreator('notifications/BATCH_MARK_READ'),
};

class MarkReadOnUnload extends Component {
  static propTypes = {
    batchMarkRead: PropTypes.func.isRequired,
  };

  componentDidMount() {
    window.addEventListener('beforeunload', this.props.batchMarkRead);
  }

  componentWillUnmount() {
    this.props.batchMarkRead();
    window.removeEventListener('beforeunload', this.props.batchMarkRead);
  }

  render() {
    return null;
  }
}

export const MarkNotificationsReadOnUnload = connect(
  undefined,
  mapDispatchToProps
)(MarkReadOnUnload);

export default {
  destroy: notification.destroy,
  ...Object.entries(NOTIFICATION_TYPES).reduce(
    (map, [constant, type]) => ({ ...map, [type]: createNotificationMethod(type) }),
    {}
  ),
};
