import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import Form from '../Form';
import Text from './Text';
import Date from './Date';
import Numeric from './Numeric';
import Duration from './Duration';

const Value = ({ label, children, className }) => (
  // We cant use <Form /> in order to use <Value /> inside another <Form/>
  <div
    className={cn(
      'trader-form trader-form-vertical',
      'trader-form-hide-required-mark trader-value',
      className
    )}
  >
    <Form.Item label={label}>{children}</Form.Item>
  </div>
);

Value.Text = Text;
Value.Date = Date;
Value.Numeric = Numeric;
Value.Duration = Duration;

Value.propTypes = {
  label: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Value;
