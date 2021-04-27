import React from 'react';
import PropTypes from 'prop-types';
import Menu from 'antd/lib/menu';
import cn from 'classnames';

import Button from '../Button';

const TraderMenu = props => <Menu prefixCls="trader-menu" {...props} />;

const ActionMenuItem = ({ children, title, ...bag }) => {
  const { eventKey, selectedKeys } = bag;

  return (
    <div
      className={cn('trader-menu-action-item', {
        'trader-menu-action-item-active': selectedKeys.includes(eventKey),
      })}
    >
      <Menu.Item {...bag}>{title}</Menu.Item>
      <Button.SpaceGroup className="trader-menu-action-item-buttons">{children}</Button.SpaceGroup>
    </div>
  );
};

ActionMenuItem.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
};

TraderMenu.Item = Menu.Item;
TraderMenu.ActionMenuItem = ActionMenuItem;
TraderMenu.SubMenu = Menu.SubMenu;
TraderMenu.ItemGroup = Menu.ItemGroup;
TraderMenu.Divider = Menu.Divider;

export default TraderMenu;
