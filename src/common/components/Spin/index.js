import React from 'react';
import Spin from 'antd/lib/spin';
import Icon from 'antd/lib/icon';

const EnhancedSpin = props => <Spin indicator={<Icon type="loading" spin />} {...props} />;

export default EnhancedSpin;
