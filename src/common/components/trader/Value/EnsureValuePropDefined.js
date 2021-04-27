import React from 'react';
import PropTypes from 'prop-types';

import Text from './Text';

const EnsureValuePropDefined = isValidValueMethod => WrappedComponent => props =>
  props.value === undefined ||
  props.value === null ||
  !isValidValueMethod(props.value) ||
  props.value === '' ? (
    <Text />
  ) : (
    <WrappedComponent {...props} />
  );

EnsureValuePropDefined.propTypes = {
  value: PropTypes.any,
};

export default EnsureValuePropDefined;
