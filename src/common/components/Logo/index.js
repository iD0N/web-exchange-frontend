import React from 'react';
import PropTypes from 'prop-types';
// import { NavLink } from 'react-router-dom';

import { logo, logoDark } from '../../../resources/images';

const Logo = ({ dark, path }) => {
  const img = <img src={dark ? logoDark : logo} alt="Crypto" />;

  return (
    <div className="logo">
      {/* <NavLink to={path}>{img}</NavLink> */}
      <a href="https://trade.crypto.io/">{img}</a>
    </div>
  );
};

Logo.defaultProps = {
  dark: false,
  path: '/',
};

Logo.propTypes = {
  dark: PropTypes.bool.isRequired,
  path: PropTypes.string.isRequired,
};

export default Logo;
