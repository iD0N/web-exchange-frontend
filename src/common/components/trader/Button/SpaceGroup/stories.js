import React from 'react';
import { storiesOf } from '@storybook/react';

import { Button } from '../../';

storiesOf('Trader/Button/SpaceGroup', module)
  .add('small', () => (
    <Button.SpaceGroup size="small">
      <Button size="small">First</Button>
      <Button size="small">Second</Button>
      <Button size="small">Third</Button>
    </Button.SpaceGroup>
  ))
  .add('normal', () => (
    <Button.SpaceGroup>
      <Button>First</Button>
      <Button>Second</Button>
      <Button>Third</Button>
    </Button.SpaceGroup>
  ))
  .add('large', () => (
    <Button.SpaceGroup size="large">
      <Button size="large">First</Button>
      <Button size="large">Second</Button>
      <Button size="large">Third</Button>
    </Button.SpaceGroup>
  ))
  .add('block buttons', () => (
    <Button.SpaceGroup>
      <Button block>First</Button>
      <Button block>Second</Button>
      <Button block>Third</Button>
    </Button.SpaceGroup>
  ));
