import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dropdown from 'antd/lib/dropdown';
import Icon from 'antd/lib/icon';
import cn from 'classnames';

import { IsMobile } from '../../';
import PerfectScrollbar from '../PerfectScrollbar';

import Menu from './Menu';

const TRIGGERS = {
  CLICK: ['click'],
  HOVER: ['hover'],
};

const TransferProps = ({ element, children, ...props }) =>
  children({ clonedElement: React.cloneElement(element, props) });

class TraderDropdown extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    fullHeight: PropTypes.bool,
    hideIcon: PropTypes.bool,
    hoverTrigger: PropTypes.bool,
    isMobile: PropTypes.bool.isRequired,
    overlay: PropTypes.node.isRequired,
    overlayHeader: PropTypes.node,
    scrollOptions: PropTypes.object,
    triggerClassName: PropTypes.string,
    visible: PropTypes.bool,
    onVisibleChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
    hoverTrigger: false,
    scrollOptions: { wheelPropagation: false },
    onVisibleChange: () => {},
  };

  state = {
    visible: false,
  };

  handleVisibleChange = visible => {
    this.setState({ visible }, () => this.props.onVisibleChange(visible));
  };

  handleOverlayClick = ({ key }) => {
    this.handleVisibleChange(false);
  };

  isVisible = () => (this.props.visible === undefined ? this.state.visible : this.props.visible);

  render() {
    const {
      children,
      fullHeight,
      hideIcon,
      hoverTrigger,
      isMobile,
      overlay,
      overlayHeader,
      scrollOptions,
      triggerClassName,
      ...bag
    } = this.props;

    const visible = this.isVisible();

    return (
      <Dropdown
        trigger={!isMobile && hoverTrigger ? TRIGGERS.HOVER : TRIGGERS.CLICK}
        {...bag}
        overlay={
          fullHeight ? (
            overlayHeader ? (
              <TransferProps {...overlay.props} element={overlay}>
                {({ clonedElement }) => (
                  <>
                    {overlayHeader}
                    {clonedElement}
                  </>
                )}
              </TransferProps>
            ) : (
              overlay
            )
          ) : (
            <TransferProps {...overlay.props} element={overlay}>
              {({ clonedElement }) => (
                <>
                  {overlayHeader}
                  <PerfectScrollbar option={scrollOptions}>{clonedElement}</PerfectScrollbar>
                </>
              )}
            </TransferProps>
          )
        }
        visible={visible}
        onOverlayClick={this.handleOverlayClick}
        onVisibleChange={this.handleVisibleChange}
        prefixCls="trader-dropdown"
      >
        <div className={cn(triggerClassName, { visible })}>
          {children}
          {!hideIcon && <Icon type="down" />}
        </div>
      </Dropdown>
    );
  }
}

const EnhancedDropdown = IsMobile(TraderDropdown);

EnhancedDropdown.Menu = Menu;

export default EnhancedDropdown;
