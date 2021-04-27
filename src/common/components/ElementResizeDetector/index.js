import React, { Component } from 'react';
import PropTypes from 'prop-types';
import elementResizeDetector from 'element-resize-detector';
import debounce from 'lodash.debounce';

class ElementResizeDetector extends Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
    debounceMs: PropTypes.number,
    defaultHeight: PropTypes.number,
    defaultWidth: PropTypes.number,
    elementSelector: PropTypes.func.isRequired,
    ignoreHeight: PropTypes.bool,
    ignoreWidth: PropTypes.bool,
  };

  static defaultProps = {
    debounceMs: 500,
  };

  state = {
    height: this.props.ignoreHeight ? undefined : this.props.defaultHeight,
    width: this.props.ignoreWidth ? undefined : this.props.defaultWidth,
  };

  resizeDetector = undefined;

  componentDidMount() {
    this.initialize();
  }

  componentDidUpdate() {
    if (!this.resizeDetector) {
      this.initialize();
    }
  }

  componentWillUnmount() {
    this.resizeDetector &&
      this.props.elementSelector() &&
      this.resizeDetector.uninstall(this.props.elementSelector());
    this.handleResize.cancel && this.handleResize.cancel();
  }

  initialize() {
    const element = this.props.elementSelector();

    if (element) {
      this.resizeDetector = elementResizeDetector({
        strategy: 'scroll',
      });

      this.resizeDetector.listenTo(element, this.handleResize);
    }
  }

  updateDimensions = ({ clientHeight, clientWidth }) => {
    const { ignoreHeight, ignoreWidth } = this.props;
    const { height, width } = this.state;

    this.setState({
      height: ignoreHeight ? height : clientHeight,
      width: ignoreWidth ? width : clientWidth,
    });
  };

  handleResize = this.props.debounceMs
    ? dimensions => {
        this.updateDimensions(dimensions);
        this.handleResize = debounce(this.updateDimensions, this.props.debounceMs);
      }
    : this.updateDimensions;

  render() {
    const { children } = this.props;
    const { height, width } = this.state;

    return children({
      height,
      width,
    });
  }
}

const ElementResizeDetectorHoC = ({
  debounceMs,
  defaultHeight,
  defaultWidth,
  ignoreHeight,
  ignoreWidth,
} = {}) => WrapperComponent => ({ elementSelector, ...bag }) => (
  <ElementResizeDetector
    debounceMs={debounceMs}
    defaultHeight={defaultHeight}
    defaultWidth={defaultWidth}
    ignoreHeight={ignoreHeight}
    ignoreWidth={ignoreWidth}
    elementSelector={elementSelector}
  >
    {({ height, width }) => (
      <WrapperComponent {...bag} measuredHeight={height} measuredWidth={width} />
    )}
  </ElementResizeDetector>
);

ElementResizeDetector.HoC = ElementResizeDetectorHoC;

export default ElementResizeDetector;
