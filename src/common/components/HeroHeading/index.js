import React from 'react';
import PropTypes from 'prop-types';

import Hero from '../Hero';

const HeroHeading = ({ heading, description, footer, children }) => (
  <Hero className="hero-heading">
    <h1>{heading}</h1>
    {description && <p>{description}</p>}
    {children}
    <div className="hero-heading-footer">{footer}</div>
  </Hero>
);

HeroHeading.propTypes = {
  heading: PropTypes.node.isRequired,
  footer: PropTypes.node,
  description: PropTypes.node,
};

export default HeroHeading;
