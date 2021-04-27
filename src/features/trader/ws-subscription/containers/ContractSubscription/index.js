import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import difference from 'lodash.difference';

import { subscribeAction, unsubscribeAction } from '../../ducks';

const mapDispatchToProps = {
  subscribe: subscribeAction,
  unsubscribe: unsubscribeAction,
};

class ContractSubscription extends Component {
  static propTypes = {
    contractCodes: PropTypes.array.isRequired,
    channel: PropTypes.string.isRequired,
    children: PropTypes.node,
    subscribe: PropTypes.func.isRequired,
    unsubscribe: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { subscribe, contractCodes, channel } = this.props;

    contractCodes.forEach(contractCode => {
      subscribe({
        channel,
        contractCode,
      });
    });
  }

  componentDidUpdate({ contractCodes: prevContractCodes }) {
    const { subscribe, unsubscribe, contractCodes, channel } = this.props;

    const removedContractCodes = difference(prevContractCodes, contractCodes);
    const addedContractCodes = difference(contractCodes, prevContractCodes);

    removedContractCodes.forEach(contractCode => {
      unsubscribe({ channel, contractCode });
    });

    addedContractCodes.forEach(contractCode => {
      subscribe({ channel, contractCode });
    });
  }

  componentWillUnmount() {
    const { unsubscribe, contractCodes, channel } = this.props;

    contractCodes.forEach(contractCode => {
      unsubscribe({ channel, contractCode });
    });
  }

  render() {
    return this.props.children || null;
  }
}

export default connect(undefined, mapDispatchToProps)(ContractSubscription);
