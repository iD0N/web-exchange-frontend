/* eslint-disable import/first */
import 'react-testing-library/cleanup-after-each';
import 'jest-dom/extend-expect';
import 'jest-canvas-mock';

jest.mock('./app/store/configureStore');
jest.mock('./common/services/i18n');

window.WebSocket = class WebSocketMock {
  static closeMock = jest.fn();

  constructor(url) {
    this.close = WebSocketMock.closeMock;
  }
};

import { configureAmplify } from './common/services/amplify';

configureAmplify();

// Monkey patch console.warn, to filter spam from async-validator
// https://github.com/yiminghe/async-validator/issues/92
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const [arg] = args;

  return typeof arg === 'string' && arg.includes('async-validator')
    ? undefined
    : originalConsoleWarn.apply(console, args);
};
