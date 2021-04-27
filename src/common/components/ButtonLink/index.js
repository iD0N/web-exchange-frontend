import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import Button from '../Button';

const ButtonLink = ({ to, history, staticContext, location, match, ...props }) => (
  <Button {...props} onClick={() => history.push(to)} />
);

ButtonLink.propTypes = {
  to: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(ButtonLink);
