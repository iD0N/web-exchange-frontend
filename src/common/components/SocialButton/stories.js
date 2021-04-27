import React from 'react';
import { storiesOf } from '@storybook/react';

import SocialButton from './';

storiesOf('SocialButton', module)
  .add('Google', () => <SocialButton type="google">Sign in</SocialButton>)
  .add('Facebook', () => <SocialButton type="facebook">Sign in</SocialButton>);
