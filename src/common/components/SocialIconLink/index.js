import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

const SocialIconLink = ({ href, className }) => (
  <a
    href={href}
    className={cn('social-icon-link', className)}
    target="_blank"
    rel="noopener noreferrer"
  >
    <span>{className}</span>
  </a>
);

SocialIconLink.propTypes = {
  className: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
};

export default SocialIconLink;
