import React from 'react';
import { storiesOf } from '@storybook/react';

import Divider from './';

storiesOf('Divider', module).add('plain', () => (
  <div>
    <Divider />
    <Divider plain>I am without lines</Divider>
    <Divider dashed>Dashed</Divider>
    <Divider dashed />
  </div>
));
