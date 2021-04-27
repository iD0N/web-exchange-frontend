import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Popover from 'antd/lib/popover';
import Icon from 'antd/lib/icon';

class TraderPopover extends Component {
  static propTypes = {
    showCloseIcon: PropTypes.bool,
    visible: PropTypes.bool,
    onVisibleChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
    onVisibleChange: () => {},
  };

  state = {
    visible: false,
  };

  handleVisibleChange = visible => {
    this.setState({ visible }, () => this.props.onVisibleChange(visible));
  };

  handleToggle = () => {
    this.setState({ visible: !this.state.visible });
  };

  isVisible = () => (this.props.visible === undefined ? this.state.visible : this.props.visible);

  renderTitle = () => (
    <>
      {this.props.title} <Icon type="close" onClick={this.handleToggle} />
    </>
  );

  render() {
    const { showCloseIcon, title, ...props } = this.props;

    return (
      <Popover
        prefixCls="trader-popover"
        {...props}
        visible={this.isVisible()}
        title={showCloseIcon ? this.renderTitle() : title}
        onVisibleChange={this.handleVisibleChange}
      />
    );
  }
}

export default TraderPopover;
