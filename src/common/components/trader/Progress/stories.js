import React from 'react';
import { storiesOf } from '@storybook/react';

import { Progress } from '../';

storiesOf('Trader/Progress', module).add('default', () => (
  <Progress percent={50} showInfo={false} strokeWidth={3} />
));
