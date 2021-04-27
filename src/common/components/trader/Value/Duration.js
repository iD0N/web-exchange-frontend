import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import Text from './Text';

const verboseTemplate = 'M [months], W [weeks], D [days], H [hours], m [minutes], s [seconds]';

const shorthandTemplate = 'M [mo], W [w], D [d], H[hr], m[m]';

const durationsQueue = [];

setInterval(() => {
  durationsQueue.forEach(({ refresh } = {}) => {
    if (refresh) {
      refresh();
    }
  });
}, 1000);

function durationTemplate() {
  const { duration } = this;
  if (duration.asSeconds() < 60) {
    return 's[s],';
  } else if (duration.asMinutes() < 60) {
    return 'm[m]';
  } else if (duration.asHours() < 24) {
    return 'H[h]';
  } else if (duration.asDays() < 7) {
    return 'D[d]';
  } else if (duration.asWeeks() <= 4) {
    return 'W[w]';
  } else if (duration.asMonths() < 12) {
    return 'M[mo]';
  } else return 'Y[y]';
}

export const durationFormatter = ({ value, reverted, shorthand, verbose }) => {
  const duration = reverted ? moment(value).diff(moment()) : moment().diff(value);

  const string = moment
    .duration(reverted ? (duration <= 0 ? 0 : duration) : duration)
    .format(verbose ? (shorthand ? shorthandTemplate : verboseTemplate) : durationTemplate, {
      trim: false,
      useToLocaleString: false,
    });

  let foundFirstNonZero = false;
  let parts = verbose ? string.split(', ') : [];
  return verbose
    ? parts
        .filter((a, index) => {
          if (a.substring(0, 2) !== '0 ' || index === parts.length - 1) {
            foundFirstNonZero = true;
          }
          return foundFirstNonZero;
        })
        .map(a => (shorthand ? a.replace(' ', '') : a))
        .join(', ')
    : string;
};

export default class Duration extends PureComponent {
  static propTypes = {
    value: PropTypes.any.isRequired,
    verbose: PropTypes.bool,
    reverted: PropTypes.bool,
  };

  state = {
    value: undefined,
  };

  componentDidMount() {
    durationsQueue.push(this);
    this.refresh();
  }

  componentWillUnmount() {
    const index = durationsQueue.findIndex(item => item === this);
    if (index !== -1) {
      durationsQueue.splice(index, 1);
    }
  }

  refresh = () => {
    const { reverted, shorthand, value, verbose } = this.props;

    this.setState({
      value: durationFormatter({ value, reverted, shorthand, verbose }),
    });
  };

  render() {
    const { value } = this.state;

    return value ? <Text>{value}</Text> : null;
  }
}
