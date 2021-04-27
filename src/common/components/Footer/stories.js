import React from 'react';
import { storiesOf } from '@storybook/react';
import StoryRouter from 'storybook-react-router';

import Footer from './';

storiesOf('Home/Footer', module)
  .addDecorator(StoryRouter())
  .add('default', () => <Footer />);
