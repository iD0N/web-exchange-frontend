import React, { Component } from 'react';
import PropTypes from 'prop-types';
import pick from 'lodash.pick';
import omit from 'lodash.omit';

import Form from './';
import { FormContext } from './FormScreen';

const fieldOptionsPropTypes = {
  getValueFromEvent: PropTypes.func,
  initialValue: PropTypes.any,
  normalize: PropTypes.func,
  rules: PropTypes.arrayOf(PropTypes.object),
  trigger: PropTypes.string,
  validateFirst: PropTypes.bool,
  validateTrigger: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  valuePropName: PropTypes.string,
};

export const propTypes = {
  id: PropTypes.string.isRequired,
  ...fieldOptionsPropTypes,
  children: PropTypes.node.isRequired,
};

const fieldOptionsKeys = Object.keys(fieldOptionsPropTypes);

export function pickFieldOptions(props) {
  return pick(props, fieldOptionsKeys);
}

export function pickFormItemProps(props) {
  return omit(props, fieldOptionsKeys);
}

export function FormItemHOC(WrappedComponent, disableFloatingLabel) {
  return class extends Component {
    static propTypes = propTypes;

    state = {
      isFocused: false,
      didBlur: false,
    };

    handleBlur = () => {
      this.setState({
        isFocused: false,
        didBlur: true,
      });
    };

    handleFocus = () => {
      this.setState({
        isFocused: true,
      });
    };

    renderField(form) {
      const { id, children, ...props } = this.props;
      const { isFocused } = this.state;

      return form.getFieldDecorator(
        id,
        pickFieldOptions(props)
      )(
        React.cloneElement(
          React.Children.only(children),
          isFocused && !disableFloatingLabel
            ? {
                onFocus: this.handleFocus,
                onBlur: this.handleBlur,
                placeholder: '',
              }
            : {
                onFocus: this.handleFocus,
                onBlur: this.handleBlur,
              }
        )
      );
    }

    render() {
      const { id, ...props } = this.props;
      const { didBlur, isFocused } = this.state;

      return (
        <FormContext.Consumer>
          {({ form }) => {
            const field = this.renderField(form); // must be rendered first, so form model exists

            const fieldError = didBlur && form.isFieldTouched(id) && form.getFieldError(id);
            const value = form.getFieldValue(id);

            return (
              <WrappedComponent
                floating={(!!value || isFocused) && !disableFloatingLabel}
                {...pickFormItemProps(props)}
                help={fieldError ? fieldError[0] : ''}
                validateStatus={fieldError ? 'error' : ''}
              >
                {field}
              </WrappedComponent>
            );
          }}
        </FormContext.Consumer>
      );
    }
  };
}

export default FormItemHOC(Form.Item);
