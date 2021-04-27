const { getLoginUrl, configureAmplify } = require.requireActual('../amplify');
export { getLoginUrl, configureAmplify };
// TODO:
// when requiring actual & exporting mock, the function is not supplied in actual implementation which uses the module
export const handleAmplifyError = jest.fn();
