import { Component } from 'react';
import PropTypes from 'prop-types';

export default class DisableBodyScroll extends Component {
  static propTypes = {
    elementSelector: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
  };

  element = undefined;

  freezeTouch(e) {
    e.preventDefault();
  }

  initialize = () => {
    if (!this.element) {
      this.element = this.props.elementSelector();

      if (this.element) {
        this.element.addEventListener('touchmove', this.freezeTouch, false);
      }
    }
  };

  componentDidMount() {
    this.initialize();
  }

  componentDidUpdate() {
    this.initialize();
  }

  componentWillUnmount() {
    if (this.element) {
      this.element.removeEventListener('touchmove', this.freezeTouch, false);
    }
  }

  render() {
    return this.props.children;
  }
}
