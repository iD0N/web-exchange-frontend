import React from 'react';
import { storiesOf } from '@storybook/react';

import { Badge } from '../';

storiesOf('Trader/Badge', module).add('default', () => (
  <Badge count={14}>
    <span>Default</span>
  </Badge>
));
