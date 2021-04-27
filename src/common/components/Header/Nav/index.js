import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MediaQuery from 'react-responsive';

import { Menu } from '../../';

import ResponsiveMenu from './ResponsiveMenu';

const COLLAPSED_NAV_MAX_WIDTH = 991;

class Nav extends Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
    activePathname: PropTypes.string.isRequired,
    history: PropTypes.object.isRequired,
  };

  state = {
    responsiveMenuVisible: false,
  };

  onChangeResponsiveMenuVisible = responsiveMenuVisible => {
    this.setState({ responsiveMenuVisible });
  };

  render() {
    const { children, activePathname, history } = this.props;

    return (
      <MediaQuery maxWidth={`${COLLAPSED_NAV_MAX_WIDTH}px`}>
        {isCollapsedNav =>
          isCollapsedNav ? (
            <ResponsiveMenu
              selectedKeys={[activePathname]}
              visible={this.state.responsiveMenuVisible}
              history={history}
              showResponsiveMenu={() => this.onChangeResponsiveMenuVisible(true)}
              hideResponsiveMenu={() => this.onChangeResponsiveMenuVisible(false)}
              toggleResponsiveMenu={this.onChangeResponsiveMenuVisible}
            >
              {children({ isCollapsedNav })}
            </ResponsiveMenu>
          ) : (
            <Menu
              mode="horizontal"
              theme="dark"
              selectedKeys={[activePathname]}
              onClick={this.handleClick}
            >
              {children({ isCollapsedNav })}
            </Menu>
          )
        }
      </MediaQuery>
    );
  }
}

export default Nav;
