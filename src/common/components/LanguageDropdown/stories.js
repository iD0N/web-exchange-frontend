import React from 'react';
import { storiesOf } from '@storybook/react';

import Store from '../../../../.storybook/addons/Store';
import { ENGLISH } from '../../services/i18n';

import LanguageDropdown from './';

storiesOf('LanguageDropdown', module)
  .addDecorator(Store.Decorator({ value: ENGLISH }))
  .add('default', () => ({ value, setState }) => (
    <LanguageDropdown value={value} onChange={value => setState({ value })} />
  ));
