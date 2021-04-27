import React from 'react';
import PropTypes from 'prop-types';
import Form from 'antd/lib/form';
import cn from 'classnames';

const EnhancedForm = props => <Form hideRequiredMark layout="vertical" {...props} />;

const EnhancedFormItem = ({ floating, className, ...props }) => (
  <Form.Item
    {...props}
    className={cn(className, {
      'with-floating-label': floating,
    })}
  />
);

EnhancedFormItem.propTypes = {
  floating: PropTypes.bool,
  className: PropTypes.string,
};

EnhancedForm.create = Form.create;
EnhancedForm.Item = EnhancedFormItem;
EnhancedForm.createFormField = Form.createFormField;

export default EnhancedForm;
