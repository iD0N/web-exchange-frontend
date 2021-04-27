import React from 'react';
import List from 'antd/lib/list';

const TraderList = props => <List prefixCls="trader-list" {...props} />;

TraderList.Item = List.Item;

export default TraderList;
