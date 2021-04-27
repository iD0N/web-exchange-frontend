import React from 'react';
import PropTypes from 'prop-types';
import Button from 'antd/lib/button';
import cn from 'classnames';

const EnhancedButton = ({ link, className, upper, ...props }) => (
  <Button
    {...props}
    className={cn(className, {
      'ant-btn-link': link,
      'trader-btn-upper': upper,
    })}
  />
);

EnhancedButton.propTypes = {
  link: PropTypes.bool,
  upper: PropTypes.bool,
};

export default EnhancedButton;
