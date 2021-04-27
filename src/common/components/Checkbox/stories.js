import React from 'react';
import { storiesOf } from '@storybook/react';

import Widget from '../Widget';

import Checkbox from './';

storiesOf('Checkbox', module).add('multiline', () => (
  <Widget>
    <Checkbox className="ant-checkbox-multiline">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sit amet volutpat arcu. Fusce
      nec purus tristique, rutrum ipsum eget, dictum odio. Sed condimentum quam et nunc fermentum.
    </Checkbox>
  </Widget>
));
