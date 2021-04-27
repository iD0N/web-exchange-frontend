import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import { Icon } from '../../../../../../../common/components';
import { Tooltip, Value } from '../../../../../../../common/components/trader';

const MAX_CONDENSED_LENGTH = 90;
const TRUNCATED_LENGTH = 80;

const typeIcon = {
  info: 'info-circle',
  warning: 'exclamation-circle',
  warn: 'exclamation-circle',
  success: 'check-circle',
  error: 'close-circle',
};

export default class NotificationItem extends Component {
  static propTypes = {
    notification: PropTypes.object.isRequired,
    visible: PropTypes.bool.isRequired,
  };

  state = {
    expanded: false,
  };

  componentDidUpdate({ visible: wasVisible }) {
    if (this.state.expanded && !wasVisible && this.props.visible) {
      this.setState({ expanded: false });
    }
  }

  toggleExpanded = () => this.setState({ expanded: !this.state.expanded });

  renderCondensed = () => {
    const {
      notification: { body },
    } = this.props;

    if (!body) {
      return null;
    }

    if (body.length <= MAX_CONDENSED_LENGTH) {
      return body;
    }

    return (
      <>
        {body.substring(0, TRUNCATED_LENGTH)}...{' '}
        <span className="see-more" onClick={this.toggleExpanded}>
          [+]
        </span>
      </>
    );
  };

  renderExpanded = () => {
    const {
      notification: { body, sticky },
    } = this.props;

    return (
      <>
        {body}{' '}
        {!sticky && (
          <span className="see-less" onClick={this.toggleExpanded}>
            [-]
          </span>
        )}
      </>
    );
  };

  render() {
    const {
      notification: { body, subject, type, read, timestamp, sticky },
    } = this.props;
    const { expanded } = this.state;

    return (
      !!body && (
        <div
          className={cn('notification-wrapper-outer', {
            'notification-wrapper-outer-sticky': sticky,
          })}
        >
          <div className={cn('notification-wrapper', { 'notification-unread': !read || sticky })}>
            <Icon type={typeIcon[type]} />
            <div className="notification-wrapper-inner">
              <div className="notification-subject">{subject}</div>
              <div>
                <span>{expanded || sticky ? this.renderExpanded() : this.renderCondensed()}</span>
                <span className="notification-time">
                  <Tooltip title={<Value.Date type="datetime" value={timestamp} />}>
                    <Value.Duration value={timestamp} />
                  </Tooltip>
                </span>
              </div>
            </div>
          </div>
        </div>
      )
    );
  }
}
