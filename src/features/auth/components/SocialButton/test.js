/* eslint-disable import/first */
jest.mock('react-i18next');
jest.mock('../../../../common/services/i18n');
jest.mock('../../../../common/services/amplify');

import React from 'react';
import renderer from 'react-test-renderer';

import { configureAmplify } from '../../../../common/services/amplify';

import SocialButton from '../SocialButton';

describe('Social buttons', () => {
  beforeAll(() => {
    configureAmplify();
  });

  it('provides Google sign in', () => {
    expect(renderer.create(<SocialButton provider="Google" />).toJSON()).toMatchSnapshot();
  });

  it('provides Facebook sign in', () => {
    expect(renderer.create(<SocialButton provider="Facebook" />).toJSON()).toMatchSnapshot();
  });
});
