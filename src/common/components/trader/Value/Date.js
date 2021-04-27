import React, { memo } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import EnsureValuePropDefined from './EnsureValuePropDefined';
import Text from './Text';

const EnsureDateValuePropDefined = EnsureValuePropDefined(value => moment(value).isValid());

const FORMATTERS = {
  time: value => moment(value).format('HH:mm:ss'),
  month: value => moment(value).format('MMM YYYY'),
  date: value => moment(value).format('MM/DD/YYYY'),
  datetime: value => moment(value).format('MMMM Do YYYY, h:mm:ss a'),
  datetimeAbbrev: value => moment(value).format('MM/DD/YYYY HH:mm:ss'),
  datetimeUtc: value => moment.utc(value).format('DD MMMM YYYY HH:mm:ss') + ' UTC',
};

export const dateFormatter = (value, type) => FORMATTERS[type](value);

const DateValue = ({ value, type, utc, ...bag }) => (
  <Text {...bag}>{dateFormatter(utc ? moment(value).utc() : value, type)}</Text>
);

DateValue.propTypes = {
  utc: PropTypes.bool,
  value: PropTypes.any.isRequired,
  type: PropTypes.oneOf(Object.keys(FORMATTERS)).isRequired,
};

export default memo(EnsureDateValuePropDefined(DateValue));
