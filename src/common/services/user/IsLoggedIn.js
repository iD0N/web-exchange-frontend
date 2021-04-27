import { connect } from 'react-redux';

import { selectIsLoggedIn } from './';

const mapStateToProps = state => ({
  isLoggedIn: selectIsLoggedIn(state),
});

const IsLoggedIn = WrappedComponent => connect(mapStateToProps)(WrappedComponent);

export default IsLoggedIn;
