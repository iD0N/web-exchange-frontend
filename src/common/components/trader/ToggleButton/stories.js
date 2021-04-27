import React, { Component } from 'react';
import { storiesOf } from '@storybook/react';

import Row from '../../../../../.storybook/addons/Row';

import { FontIcon } from '../../';
import { ToggleButton, Value, Tooltip } from '../';

class ControlledToggleButton extends Component {
  state = {
    active: false,
  };

  render() {
    const { active } = this.state;

    return (
      <Tooltip title="Crosshair">
        <ToggleButton active={active} onClick={() => this.setState({ active: !active })}>
          <FontIcon type="crosshair" />
        </ToggleButton>
      </Tooltip>
    );
  }
}

storiesOf('Trader/ToggleButton', module).add('default', () => (
  <>
    <Row>
      <Value label="Controlled">
        <ControlledToggleButton />
      </Value>
    </Row>
    <Row>
      <Value label="default">
        <ToggleButton size="small">
          <FontIcon type="crosshair" />
        </ToggleButton>
        <ToggleButton>
          <FontIcon type="crosshair" />
        </ToggleButton>
        <ToggleButton size="large">
          <FontIcon type="crosshair" />
        </ToggleButton>
      </Value>
    </Row>
    <Row>
      <Value label="active">
        <ToggleButton active>
          <FontIcon type="crosshair" />
        </ToggleButton>
      </Value>
    </Row>
  </>
));
