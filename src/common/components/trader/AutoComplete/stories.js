import React, { Component } from 'react';
import { storiesOf } from '@storybook/react';

import { AutoComplete, Input } from '../';

const { Option, OptGroup } = AutoComplete;

storiesOf('Trader/AutoComplete', module).add('default', () => <C />);

class C extends Component {
  state = {
    results: [],
  };

  handleSelect = value => {
    console.log('onSelect', value);
  };

  handleSearch = value => {
    this.setState({
      results: !value ? [] : dataSource,
    });
  };

  renderOptions = () =>
    this.state.results.map(group => (
      <OptGroup key={group.title} label={group.title}>
        {group.children.map(opt => (
          <Option key={opt.title} value={opt.title}>
            {opt.title}
          </Option>
        ))}
      </OptGroup>
    ));

  render() {
    return (
      <AutoComplete
        allowClear
        dataSource={this.renderOptions()}
        style={{ width: 200 }}
        onSelect={this.handleSelect}
        onSearch={this.handleSearch}
        placeholder="Search by contract"
        optionLabelProp="value"
      >
        <Input />
      </AutoComplete>
    );
  }
}

const dataSource = [
  {
    title: 'Contract',
    children: [
      {
        id: 1,
        title: 'GCM8',
      },
      {
        id: 2,
        title: 'GCN8',
      },
      {
        id: 3,
        title: 'GCQ8',
      },
    ],
  },
  {
    title: 'Exchange',
    children: [
      {
        id: 1,
        title: 'GDAX',
      },
      {
        id: 2,
        title: 'GMAX',
      },
      {
        id: 3,
        title: 'GLAX',
      },
    ],
  },
];
