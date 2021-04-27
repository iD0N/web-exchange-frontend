/* eslint-disable import/first */
jest.mock('../../common/services/i18n');
jest.mock('../../common/services/amplify');

import { expectSaga, testSaga } from 'redux-saga-test-plan';
import { push } from 'react-router-redux';
import { Auth } from 'aws-amplify';

import { startApiCall, finishApiCall } from '../../common/services/spinner';
import { AMPLIFY_ERROR_CODES, AMPLIFY_CHALLENGE_TYPES } from '../../common/enums';
import { loginActions, acceptTerms, fetchProfile } from '../../common/services/user';
import api from '../../common/services/user/api';

import {
  SIGN_UP,
  STORE_CREDENTIALS,
  storeCredentialsAction,
  selectCredentials,
  selectEmailCredentialExists,
  login,
  confirmLogin,
  signUp,
  verifyEmail,
  resendEmailVerification,
  forgottenPassword,
  resetPassword,
  authSaga,
  setPreMfaUserAction,
} from './ducks';
import { apiCallIds } from './api';

function apiCallActions(apiCallId) {
  return {
    start: startApiCall({ apiCallId }),
    finish: finishApiCall({ apiCallId }),
  };
}

describe('features/auth/ducks.js', () => {
  describe('selectors', () => {
    const auth = {
      credentials: null,
    };

    const state = { auth };

    describe('#selectCredentials', () => {
      it('should return empty credentials', () => {
        expect(selectCredentials(state)).toEqual({});
      });
    });

    describe('#selectEmailCredentialExists', () => {
      describe('when credentials do not exist', () => {
        it('should return false', () => {
          expect(selectEmailCredentialExists(state)).toBe(false);
        });
      });

      describe('when credentials exist', () => {
        const state = {
          auth: {
            credentials: {
              email: 'email',
              password: 'password',
            },
          },
        };

        it('should return true', () => {
          expect(selectEmailCredentialExists(state)).toBe(true);
        });
      });
    });
  });

  describe('sagas', () => {
    describe('#signup', () => {
      const singupApiCallActions = apiCallActions(apiCallIds.SIGN_UP);
      const terms = {
        data: {
          dummy: 'data',
        },
      };
      const credentials = {
        email: 'email',
        password: 'password',
      };
      const { password, ...storedCredentials } = credentials;
      const user = {
        userSub: '1',
        userConfirmed: false,
      };
      const confirmedUser = {
        ...user,
        userConfirmed: true,
      };
      const referralCode = '12345678';

      it('runs after dispatched action', () =>
        expectSaga(authSaga)
          .provide({
            call({ fn, args }, next) {
              switch (fn) {
                case Auth.signUp:
                  expect(args[0]).toEqual({
                    username: credentials.email,
                    password: credentials.password,
                    attributes: {
                      locale: 'en',
                    },
                  });
                  return user;

                case api.getTerms:
                  return terms;

                case api.acceptTerms:
                  expect(args).toEqual([terms.data, user.userSub, referralCode]);
                  return undefined;

                default:
                  return next();
              }
            },
          })
          .put(singupApiCallActions.start)
          .fork(acceptTerms, user.userSub, referralCode)
          .put({ type: STORE_CREDENTIALS, payload: storedCredentials })
          .put(push('/auth/verify-email'))
          .put(singupApiCallActions.finish)
          .dispatch({ type: SIGN_UP, payload: { ...credentials, referralCode } })
          .run());

      it('should register the user and verify email when not confirmed', () => {
        const { password, ...storedCredentials } = credentials;
        testSaga(signUp, { payload: { ...credentials, referralCode } })
          .next()
          .put(singupApiCallActions.start)
          .next()
          .call([Auth, Auth.signUp], {
            username: credentials.email,
            password: credentials.password,
            attributes: {
              locale: 'en',
            },
          })
          .next(user)
          .fork(acceptTerms, user.userSub, referralCode)
          .next()
          .put({ type: STORE_CREDENTIALS, payload: storedCredentials })
          .next()
          .put(push('/auth/verify-email'))
          .next()
          .put(singupApiCallActions.finish)
          .next()
          .isDone();
      });

      it('should register the user and login when confirmed', () => {
        testSaga(signUp, { payload: { ...credentials, referralCode } })
          .next()
          .put(singupApiCallActions.start)
          .next()
          .call([Auth, Auth.signUp], {
            username: credentials.email,
            password: credentials.password,
            attributes: {
              locale: 'en',
            },
          })
          .next(confirmedUser)
          .fork(acceptTerms, confirmedUser.userSub, referralCode)
          .next()
          .put(loginActions.request(credentials))
          .next()
          .put(singupApiCallActions.finish)
          .next()
          .isDone();
      });

      it('handles error', () => {
        const error = new Error();

        testSaga(signUp, { payload: credentials })
          .next()
          .next()
          .throw(error)
          .put(singupApiCallActions.finish)
          .next()
          .isDone();

        // expect(handleAmplifyError).toBeCalledWith(error);
      });
    });

    describe('#login', () => {
      const loginApiCallActions = apiCallActions(apiCallIds.LOGIN);
      const credentials = {
        email: 'email',
        password: 'password',
      };
      const { password, ...storedCredentials } = credentials;

      describe('when user has verified email', () => {
        describe('when MFA is disabled', () => {
          it('should successfully sign in the user', () => {
            const user = {};

            testSaga(login, { payload: credentials })
              .next()
              .put(loginApiCallActions.start)
              .next()
              .call([Auth, Auth.signIn], credentials.email, credentials.password)
              .next(user)
              .call(fetchProfile)
              .next()
              .put(loginActions.success())
              .next()
              .put(loginApiCallActions.finish)
              .next()
              .isDone();
          });

          describe('when password reset is required', () => {
            const resetPasswordError = {
              code: AMPLIFY_ERROR_CODES.PASSWORD_RESET_REQUIRED,
            };

            it('should redirect to reset-password', () => {
              testSaga(login, { payload: credentials })
                .next()
                .put(loginApiCallActions.start)
                .next()
                .call([Auth, Auth.signIn], credentials.email, credentials.password)
                .throw(resetPasswordError)
                .call([Auth, Auth.forgotPassword], credentials.email)
                .next()
                .put(storeCredentialsAction({ email: credentials.email }))
                .next()
                .put(push('/auth/reset-password'))
                .next()
                .put(loginApiCallActions.finish)
                .next()
                .isDone();
            });
          });
        });

        describe('when MFA is enabled', () => {
          it('should require login confirmation with TOTP', () => {
            const user = {
              challengeName: AMPLIFY_CHALLENGE_TYPES.SOFTWARE_TOKEN_MFA,
            };

            testSaga(login, { payload: credentials })
              .next()
              .put(loginApiCallActions.start)
              .next()
              .call([Auth, Auth.signIn], credentials.email, credentials.password)
              .next(user)
              .put(setPreMfaUserAction(user))
              .next()
              .put(push('/auth/confirm-login'))
              .next()
              .put(loginApiCallActions.finish)
              .next()
              .isDone();
          });
        });
      });

      describe('when user has not verified email', () => {
        it('should redirect to verify email', () => {
          testSaga(login, { payload: credentials })
            .next()
            .put(loginApiCallActions.start)
            .next()
            .call([Auth, Auth.signIn], credentials.email, credentials.password)
            .throw({ code: AMPLIFY_ERROR_CODES.NOT_CONFIRMED })
            .put({ type: STORE_CREDENTIALS, payload: storedCredentials })
            .next()
            .put(push('/auth/verify-email'))
            .next()
            .put(loginApiCallActions.finish)
            .next()
            .isDone();
        });
      });
    });

    describe('#verifyEmail', () => {
      const verifyEmailApiCallActions = apiCallActions(apiCallIds.VERIFY_EMAIL);

      it('should auto-login when credentials are stored', () => {
        const payload = {
          code: 'code',
        };

        const credentials = {
          email: 'email',
          password: 'password',
        };

        testSaga(verifyEmail, { payload })
          .next()
          .put(verifyEmailApiCallActions.start)
          .next()
          .select(selectCredentials)
          .next(credentials)
          .call([Auth, Auth.confirmSignUp], credentials.email, payload.code)
          .next()
          .put(loginActions.request(credentials))
          .next()
          .put(verifyEmailApiCallActions.finish)
          .next()
          .isDone();
      });

      it('should navigate to login when credentials are not stored', () => {
        const payload = {
          code: 'code',
        };

        const credentials = {};

        testSaga(verifyEmail, { payload })
          .next()
          .put(verifyEmailApiCallActions.start)
          .next()
          .select(selectCredentials)
          .next(credentials)
          .call([Auth, Auth.confirmSignUp], payload.email, payload.code)
          .next()
          .put(push('/auth/login'))
          .next()
          .put(verifyEmailApiCallActions.finish)
          .next()
          .isDone();
      });
    });

    describe('#resendEmailVerification', () => {
      const resendEmailVerificationApiCallActions = apiCallActions(
        apiCallIds.RESEND_EMAIL_VERIFICATION
      );

      const payload = {
        email: 'email',
      };

      it('should use stored email when available', () => {
        const credentials = {
          email: 'credentialsEmail',
        };

        testSaga(resendEmailVerification, { payload })
          .next()
          .put(resendEmailVerificationApiCallActions.start)
          .next()
          .select(selectCredentials)
          .next(credentials)
          .call([Auth, Auth.resendSignUp], credentials.email)
          .next()
          .put(resendEmailVerificationApiCallActions.finish)
          .next()
          .isDone();
      });

      it('should send email to the provided address', () => {
        const credentials = {};

        testSaga(resendEmailVerification, { payload })
          .next()
          .put(resendEmailVerificationApiCallActions.start)
          .next()
          .select(selectCredentials)
          .next(credentials)
          .call([Auth, Auth.resendSignUp], payload.email)
          .next()
          .put(resendEmailVerificationApiCallActions.finish)
          .next()
          .isDone();
      });
    });

    describe('#forgottenPassword', () => {
      const forgottenPasswordApiCallActions = apiCallActions(apiCallIds.FORGOTTEN_PASSWORD);

      const payload = {
        email: 'email',
      };

      it('should initiate password reset and store email for reset submit', () => {
        testSaga(forgottenPassword, { payload })
          .next()
          .put(forgottenPasswordApiCallActions.start)
          .next()
          .call([Auth, Auth.forgotPassword], payload.email)
          .next()
          .put(storeCredentialsAction({ email: payload.email }))
          .next()
          .put(push('/auth/reset-password'))
          .next()
          .put(forgottenPasswordApiCallActions.finish)
          .next()
          .isDone();
      });
    });

    describe('#resetPassword', () => {
      const resetPasswordApiCallActions = apiCallActions(apiCallIds.RESET_PASSWORD);

      const payload = {
        email: 'email',
        code: 'code',
        password: 'password',
        confirmNewPassword: 'password',
      };

      it('should reset password of stored email and login', () => {
        const credentials = {
          email: 'credentialsEmail',
        };

        testSaga(resetPassword, { payload })
          .next()
          .put(resetPasswordApiCallActions.start)
          .next()
          .select(selectCredentials)
          .next(credentials)
          .call(
            [Auth, Auth.forgotPasswordSubmit],
            credentials.email,
            payload.code,
            payload.password
          )
          .next()
          .put(loginActions.request({ email: credentials.email, password: payload.password }))
          .next()
          .put(resetPasswordApiCallActions.finish)
          .next()
          .isDone();
      });

      it('should reset password of payload email and login', () => {
        const credentials = {};

        testSaga(resetPassword, { payload })
          .next()
          .put(resetPasswordApiCallActions.start)
          .next()
          .select(selectCredentials)
          .next(credentials)
          .call([Auth, Auth.forgotPasswordSubmit], payload.email, payload.code, payload.password)
          .next()
          .put(loginActions.request({ email: payload.email, password: payload.password }))
          .next()
          .put(resetPasswordApiCallActions.finish)
          .next()
          .isDone();
      });
    });
  });
});
