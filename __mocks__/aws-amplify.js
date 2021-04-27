const Amplify = jest.genMockFromModule('aws-amplify');

Amplify.configure = config => config;

export const Auth = {
  signUp: jest.fn(),
  signIn: jest.fn(),
  currentAuthenticatedUser: jest.fn(),
  currentUserInfo: jest.fn(),
  currentSession: jest.fn(),
  getPreferredMFA: jest.fn(),
  updateUserAttributes: jest.fn(),
  confirmSignUp: jest.fn(),
  resendSignUp: jest.fn(),
  forgotPassword: jest.fn(),
  forgotPasswordSubmit: jest.fn(),
  refreshSession: jest.fn(),
};

export default Amplify;
