import React from 'react';
import TraderMenu from '../Menu';

const TraderDropdownMenu = props => <TraderMenu {...props} prefixCls="trader-dropdown-menu" />;

TraderDropdownMenu.Item = TraderMenu.Item;
TraderDropdownMenu.ActionMenuItem = TraderMenu.ActionMenuItem;
TraderDropdownMenu.SubMenu = TraderMenu.SubMenu;
TraderDropdownMenu.ItemGroup = TraderMenu.ItemGroup;
TraderDropdownMenu.Divider = TraderMenu.Divider;

export default TraderDropdownMenu;
