/* eslint-disable import/first */
jest.mock('../i18n');
jest.mock('../amplify');

import { call } from 'redux-saga/effects';
import { testSaga } from 'redux-saga-test-plan';
import { Auth } from 'aws-amplify';
import i18next from 'i18next';

import {
  selectUser,
  selectUserInfo,
  selectIsAuthenticating,
  selectIsLoggedIn,
  selectUserAttributes,
  selectUserEmail,
  selectKycStatus,
  selectIsSocialUser,
  selectEntitlements,
  selectHasAppAccess,
  fetchUserProfile,
  refreshSession,
} from './';

describe('services/user/index.js', () => {
  describe('selectors', () => {
    const user = {
      profile: {
        userInfo: {},
        preferredMfa: 'NOMFA',
        kycModel: { status: 'passed' },
        missingRequiredFields: ['email'],
        entitlements: ['app_access'],
      },
      isAuthenticating: false,
    };
    const state = { user };

    describe('#selectUser', () => {
      it('should return auth object', () => {
        expect(selectUser(state)).toBe(user);
      });
    });

    describe('#selectUserInfo', () => {
      it('should return user profile info', () => {
        expect(selectUserInfo(state)).toBe(user.profile.userInfo);
      });
    });

    describe('#selectIsAuthenticating', () => {
      it('should return isAuthenticating', () => {
        expect(selectIsAuthenticating(state)).toEqual(false);
      });
    });

    describe('#selectIsLoggedIn', () => {
      describe('when profile exists', () => {
        it('should return true', () => {
          expect(selectIsLoggedIn(state)).toEqual(true);
        });
      });

      describe('when profile is null', () => {
        it('should return false', () => {
          const loggedOutState = {
            user: {
              profile: null,
            },
          };

          expect(selectIsLoggedIn(loggedOutState)).toEqual(false);
        });
      });
    });

    describe('#selectUserAttributes', () => {
      const defaultAttributes = {
        email: '',
        given_name: '',
        family_name: '',
        locale: 'en',
      };

      describe('when logged out', () => {
        it('should return defaults', () => {
          expect(selectUserAttributes(state)).toEqual(defaultAttributes);
        });
      });

      describe('when logged in', () => {
        const state = {
          user: {
            profile: {
              userInfo: {
                attributes: {
                  email: 'email',
                  given_name: 'given_name',
                  locale: 'ko',
                },
              },
            },
          },
        };
        it('should return user attributes', () => {
          expect(selectUserAttributes(state)).toEqual({
            ...defaultAttributes,
            ...state.user.profile.userInfo.attributes,
          });
        });
      });
    });

    describe('#selectUserEmail', () => {
      describe('when logged out', () => {
        it('should return defaults', () => {
          expect(selectUserEmail(state)).toEqual('');
        });
      });

      describe('when logged in', () => {
        const state = {
          user: {
            profile: {
              userInfo: {
                attributes: {
                  email: 'email',
                },
              },
            },
          },
        };

        it('should return user attributes', () => {
          expect(selectUserEmail(state)).toEqual('email');
        });
      });
    });

    describe('#selectKycStatus', () => {
      describe('when logged out', () => {
        const state = {
          user: {
            profile: null,
          },
        };

        it('should return null', () => {
          expect(selectKycStatus(state)).toEqual(null);
        });
      });

      describe('when logged in', () => {
        it('should return current status', () => {
          expect(selectKycStatus(state)).toEqual('passed');
        });
      });
    });

    describe('#selectIsSocialUser', () => {
      const socialUserState = {
        user: {
          profile: {
            identities: ['facebook'],
          },
        },
      };

      describe('when idToken is without identities', () => {
        it('should be true', () => {
          expect(selectIsSocialUser(state)).toEqual(false);
        });
      });

      describe('when idToken has identities', () => {
        it('should be true', () => {
          expect(selectIsSocialUser(socialUserState)).toEqual(true);
        });
      });
    });

    describe('#selectEntitlements', () => {
      it('should return entitlements', () => {
        expect(selectEntitlements(state)).toEqual(['app_access']);
      });
    });

    describe('#selectHasAppAccess', () => {
      it('should return true when has app_access entitlement', () => {
        expect(selectHasAppAccess(state)).toEqual(true);
      });
    });
  });

  describe('saga helpers', () => {
    describe('#fetchUserProfile', () => {
      const idToken = {
        payload: {
          identities: ['facebook'],
          'custom:kyc_model': '{"status": "passed"}',
          'custom:missing_required_fields': '["email"]',
          'custom:entitlements': '["app_access"]',
        },
      };
      const userInfo = {
        attributes: {
          locale: 'en',
        },
      };
      const preferredMfa = 'NOMFA';
      const user = {};

      describe('when api calls succeed', () => {
        it('should finish with profile object', () => {
          testSaga(fetchUserProfile)
            .next()
            .call([Auth, Auth.currentSession])
            .next({ idToken })
            .call([Auth, Auth.currentAuthenticatedUser], { bypassCache: true })
            .next(user)
            .all([call([Auth, Auth.getPreferredMFA], user), call([Auth, Auth.currentUserInfo])])
            .next([preferredMfa, userInfo])
            .call([i18next, i18next.changeLanguage], userInfo.attributes.locale)
            .next()
            .isDone({
              userInfo,
              preferredMfa,
              identities: ['facebook'],
              kycModel: { status: 'passed' },
              missingRequiredFields: ['email'],
              entitlements: ['app_access'],
            });
        });
      });
    });
  });

  describe('sagas', () => {
    describe('#refreshSession', () => {
      const session = {
        refreshToken: 'refreshToken',
      };
      const newSession = {};
      const user = {};

      it('should update session', () => {
        testSaga(refreshSession)
          .next()
          .call([Auth, Auth.currentSession])
          .next(session)
          .call([Auth, Auth.currentAuthenticatedUser])
          .next(user)
          .call([Auth, Auth.refreshSession], user, session.refreshToken)
          .next(newSession)
          .next()
          .isDone();
      });
    });
  });
});
