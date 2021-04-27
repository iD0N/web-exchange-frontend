import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'antd/lib/icon';

import Button from '../Button';

const SocialButton = ({ type, children, ...props }) => (
  <Button {...props} type={type}>
    <Icon type={type} theme={type === 'facebook' ? 'filled' : undefined} />
    {children}
  </Button>
);

SocialButton.propTypes = {
  type: PropTypes.oneOf(['google', 'facebook']),
  children: PropTypes.node.isRequired,
};

export default SocialButton;
