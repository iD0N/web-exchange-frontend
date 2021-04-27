import React from 'react';
import { storiesOf } from '@storybook/react';

import { FontIcon } from '../../';
import { Dropdown } from '../';

const { Menu } = Dropdown;

const { Item, ItemGroup, Divider } = Menu;

const menu = (
  <Menu selectedKeys={['default']}>
    <ItemGroup title="Category">
      <Item key="default">Default</Item>
      <Item key="custom">Custom</Item>
    </ItemGroup>
    <Divider key="divider" />
    <Item key="manage">
      <FontIcon type="settings" />
      Manage
    </Item>
  </Menu>
);

storiesOf('Trader/Dropdown', module)
  .add('default', () => (
    <Dropdown overlay={menu}>
      <span>Open</span>
    </Dropdown>
  ))
  .add('sticky header', () => (
    <Dropdown
      overlay={
        <Menu selectedKeys={['default']}>
          <ItemGroup title="Scrollable content">
            <Item key="default">Default</Item>
            <Item key="custom">Custom</Item>
            <Item key="first">First</Item>
            <Item key="second">Second</Item>
            <Item key="third">Third</Item>
            <Item key="fourth">Fourth</Item>
            <Item key="fifth">Fifth</Item>
            <Item key="sixth">Sixth</Item>
            <Item key="seventh">Seventh</Item>
            <Item key="eight">Eight</Item>
            <Item key="ninth">Ninth</Item>
            <Item key="tenth">Tenth</Item>
          </ItemGroup>
        </Menu>
      }
      overlayHeader={
        <p style={{ padding: 10 }}>
          <strong>Sticked and unscrollable header</strong>
        </p>
      }
    >
      <span>Open</span>
    </Dropdown>
  ))
  .add('controlled', () => (
    <Dropdown overlay={menu} visible={true}>
      <span>Open</span>
    </Dropdown>
  ))
  .add('hover trigger', () => (
    <Dropdown hoverTrigger overlay={menu}>
      <span>Open</span>
    </Dropdown>
  ));
