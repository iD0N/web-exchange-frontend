import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import Carousel from 'antd/lib/carousel';
import Icon from 'antd/lib/icon';

const Arrow = ({ onClick, direction }) => (
  <div
    onClick={onClick}
    className={cn(
      'carousel-arrow',
      { 'carousel-arrow-left': direction === 'left' },
      { 'carousel-arrow-right': direction === 'right' }
    )}
  >
    <Icon type={direction} />
  </div>
);

Arrow.prototypes = {
  onClick: PropTypes.func.isRequired,
  direction: PropTypes.oneOf(['right', 'left']),
};

const EnhancedCarousel = props => (
  <Carousel
    dots
    arrows
    nextArrow={<Arrow direction="right" />}
    prevArrow={<Arrow direction="left" />}
    {...props}
  />
);

export default EnhancedCarousel;
