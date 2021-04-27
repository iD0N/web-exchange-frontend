import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  selectIsConnecting,
  selectIsOpen,
  selectIsClosed,
  selectNextReconnect,
} from '../../../../common/services/webSocket';
import { IsMobile } from '../../../../common/components';

import Desktop from './index.desktop';
import Mobile from './index.mobile';

const mapStateToProps = state => ({
  isConnecting: selectIsConnecting(state),
  isOpen: selectIsOpen(state),
  isClosed: selectIsClosed(state),
  nextReconnect: selectNextReconnect(state),
});

const ConnectionStatus = ({ isMobile, ...bag }) =>
  isMobile ? <Mobile {...bag} /> : <Desktop {...bag} />;

ConnectionStatus.propTypes = {
  isConnecting: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  isClosed: PropTypes.bool.isRequired,
  nextReconnect: PropTypes.string,
};

export default connect(mapStateToProps)(IsMobile(ConnectionStatus));
