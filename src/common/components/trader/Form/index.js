import React from 'react';
import Form from 'antd/lib/form';

const TraderForm = props => <Form hideRequiredMark {...props} prefixCls="trader-form" />;

TraderForm.defaultProps = {
  layout: 'vertical',
};

const TraderFormItem = props => <Form.Item colon={false} {...props} prefixCls="trader-form" />;

TraderForm.create = Form.create;
TraderForm.createFormField = Form.createFormField;
TraderForm.Item = TraderFormItem;

export default TraderForm;
