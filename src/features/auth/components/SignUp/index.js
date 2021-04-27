import React from 'react';
import PropTypes from 'prop-types';
import BodyClassName from 'react-body-classname';
import IPFilterModal from '../IPFilterModal';
import Form from './Form';

const SignUp = props => (
  <BodyClassName className="sign-up-page">
    <div className="sign-up">
      <Form {...props} />
      <IPFilterModal />
    </div>
  </BodyClassName>
);

SignUp.propTypes = {
  hasReferral: PropTypes.bool.isRequired,
};

export default SignUp;
