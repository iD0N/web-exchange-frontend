import React from 'react';
import AutoComplete from 'antd/lib/auto-complete';
import Icon from 'antd/lib/icon';

const TraderAutocomplete = props => (
  <AutoComplete prefixCls="trader-select" clearIcon={<Icon type="close" />} {...props} />
);

TraderAutocomplete.Option = AutoComplete.Option;
TraderAutocomplete.OptGroup = AutoComplete.OptGroup;

export default TraderAutocomplete;
