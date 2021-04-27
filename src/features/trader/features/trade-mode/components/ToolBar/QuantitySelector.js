import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { FormScreen } from '../../../../../../common/components';
import { Form } from '../../../../../../common/components/trader';
import SizeInput from '../../../../components/order/OrderForm/SizeInput';

const fieldKeys = ['orderQuantity'];

const mapPropsToFields = props =>
  fieldKeys.reduce(
    (map, key) =>
      props[key] && typeof props[key] === 'object'
        ? { ...map, [key]: Form.createFormField({ ...props[key] }) }
        : map,
    {}
  );

const onFieldsChange = (props, { orderQuantity }) => {
  if (orderQuantity) {
    props.onQuantityChange(orderQuantity);
  }
};

class QuantitySelector extends Component {
  static propTypes = {
    orderQuantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    onQuantityChange: PropTypes.func.isRequired,
    sizeMinimum: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    sizeStep: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  };

  shouldComponentUpdate({ orderQuantity: prevOrderQuantity, sizeStep: prevSizeStep }) {
    return this.props.orderQuantity !== prevOrderQuantity || this.props.sizeStep !== prevSizeStep;
  }

  render() {
    const { orderQuantity, sizeStep, sizeMinimum, form } = this.props;

    return (
      <FormScreen form={form} onSubmit={() => {}}>
        {({ hasErrors, handleSubmit }) => (
          <Form layout="inline" onSubmit={handleSubmit}>
            <SizeInput
              condensed
              id="orderQuantity"
              minimum={Number(sizeMinimum)}
              step={sizeStep}
              value={orderQuantity}
            />
          </Form>
        )}
      </FormScreen>
    );
  }
}

export default Form.create({
  mapPropsToFields,
  onFieldsChange,
})(QuantitySelector);
