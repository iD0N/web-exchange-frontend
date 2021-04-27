import React from 'react';
import { storiesOf } from '@storybook/react';

import Button from '../Button';

import HeroHeading from './';

storiesOf('Home/HeroHeading', module).add('default', () => (
  <HeroHeading
    heading="Congratulations! You are in!"
    description="Share your unique link and complete the actions bellow to be this week winner"
    footer={<Button type="primary">Share</Button>}
  />
));
