export const AMPLIFY_ERROR_CODES = {
  NOT_AUTHORIZED: 'NotAuthorizedException',
  NOT_CONFIRMED: 'UserNotConfirmedException',
  NO_CURRENT_USER: 'NoCurrentUser',
  USER_NOT_FOUND: 'UserNotFoundException',
  NOT_AUTHENTICATED: 'NotAuthenticated',
  CODE_MISMATCH: 'CodeMismatchException',
  CODE_EXPIRED: 'ExpiredCodeException',
  USERNAME_EXISTS: 'UsernameExistsException',
  PASSWORD_RESET_REQUIRED: 'PasswordResetRequiredException',
};

export const AMPLIFY_AUTH_CODES = {
  SIGN_IN: 'signIn',
  SIGN_UP: 'signUp',
  SIGN_OUT: 'signOut',
  SIGN_IN_FAILURE: 'signIn_failure',
};

export const AMPLIFY_CHALLENGE_TYPES = {
  SOFTWARE_TOKEN_MFA: 'SOFTWARE_TOKEN_MFA',
};

export const AMPLIFY_MFA_OPTIONS = {
  TOTP: 'TOTP',
  NOMFA: 'NOMFA',
};

export const KYC_STATUS = {
  NOT_STARTED: 'not_started',
  PROCESSING: 'processing',
  PROCESSING_MANUAL: 'processing_manual',
  PASSED: 'passed',
  FAILED_RETRYABLE: 'failed_retryable',
  FAILED: 'failed',
};

export const ORDER_TYPE = {
  LIMIT: 'limit',
  MARKET: 'market',
  STOP_LIMIT: 'stop_limit',
  STOP_MARKET: 'stop_market',
  STOP_MARKET_TRAILING: 'stop_market_trailing',
  STOP_MARKET_TRAILING_PCT: 'stop_market_trailing_pct',
  TAKE_LIMIT: 'take_limit',
  TAKE_MARKET: 'take_market',
};

export const ORDER_SIDE = {
  BUY: 'buy',
  SELL: 'sell',
  SPREAD: 'spread',
};

export const ORDER_STOP_TRIGGER = {
  MARK: 'mark',
  LAST: 'last',
  INDEX: 'index',
};

export const PEG_PRICE_TYPE = {
  NOTIONAL: 'TRAILING-STOP',
  PERCENT: 'TRAILING-STOP-PCT',
};

export const DIRECTION = {
  UP: 'up',
  DOWN: 'down',
};

export const CURRENCY_CODE = {
  USD: 'USD',
};

export const CONTRACT_TYPE = {
  FUTURE: 'future',
  SPOT: 'spot',
  SWAP: 'perp-swap',
  FUTURE_SPREAD: 'spread',
  DL_TOKEN: 'dynamic-leveraged-token',
};

export const CONTRACT_TYPE_LABEL = {
  [CONTRACT_TYPE.FUTURE]: 'trader.contract.futureLabel',
  [CONTRACT_TYPE.SPOT]: 'trader.contract.spotLabel',
  [CONTRACT_TYPE.SWAP]: 'trader.contract.swapLabel',
};
