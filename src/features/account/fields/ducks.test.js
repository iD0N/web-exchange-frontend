/* eslint-disable import/first */
jest.mock('../../../common/services/i18n');
jest.mock('../../../common/services/amplify');

import { testSaga } from 'redux-saga-test-plan';
import { push } from 'react-router-redux';
import { Auth } from 'aws-amplify';

import { startApiCall, finishApiCall } from '../../../common/services/spinner';
import { fetchProfile, refreshSession } from '../../../common/services/user';

import { apiCallIds, createAccount, acceptTermsAndRefreshSession } from './ducks';

function apiCallActions(apiCallId) {
  return {
    start: startApiCall({ apiCallId }),
    finish: finishApiCall({ apiCallId }),
  };
}

describe('features/account/fields/ducks.js', () => {
  describe('sagas', () => {
    describe('#createAccount', () => {
      const createAccountApiCallActions = apiCallActions(apiCallIds.CREATE_ACCOUNT);

      describe('when email not obtained from social provider', () => {
        it('should update email attribute and accept terms', () => {
          const referralCode = '12345678';
          const payload = {
            email: 'email',
            agreements: true,
            referralCode,
          };
          const session = {
            idToken: {
              payload: {
                sub: 'sub',
              },
            },
          };
          const user = {};

          testSaga(createAccount, { payload })
            .next()
            .put(createAccountApiCallActions.start)
            .next()
            .call([Auth, Auth.currentSession])
            .next(session)
            .fork(acceptTermsAndRefreshSession, session.idToken.payload.sub, referralCode)
            .next()
            .call([Auth, Auth.currentAuthenticatedUser])
            .next(user)
            .call([Auth, Auth.updateUserAttributes], user, { email: payload.email })
            .next()
            .call(refreshSession)
            .next()
            .call(fetchProfile)
            .next()
            .put(push('/fields/verify-email'))
            .next()
            .put(createAccountApiCallActions.finish)
            .next()
            .isDone();
        });
      });

      describe('when email obtained from social provider', () => {
        it('should accept terms and not update email', () => {
          const referralCode = '12345678';
          const payload = {
            agreements: true,
            referralCode,
          };
          const session = {
            idToken: {
              payload: {
                sub: 'sub',
              },
            },
          };

          testSaga(createAccount, { payload })
            .next()
            .put(createAccountApiCallActions.start)
            .next()
            .call([Auth, Auth.currentSession])
            .next(session)
            .call(acceptTermsAndRefreshSession, session.idToken.payload.sub, referralCode)
            .next()
            .put(push('/'))
            .next()
            .put(createAccountApiCallActions.finish)
            .next()
            .isDone();
        });
      });
    });
  });
});
