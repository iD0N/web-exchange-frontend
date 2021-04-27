import React from 'react';
import { storiesOf } from '@storybook/react';

import Widget from './';

storiesOf('Widget', module)
  .add('default', () => (
    <div>
      <Widget title="Title">Content</Widget>
    </div>
  ))
  .add('centered', () => (
    <div>
      <Widget centered title="My title">
        <p>and text are centered</p>
        <p>also there is padding for paragraphs</p>
      </Widget>
    </div>
  ));
