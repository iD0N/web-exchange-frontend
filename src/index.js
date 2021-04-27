import './bootstrap';
import React from 'react';
import { render } from 'react-dom';

import './app/styles/main-trader.css';
import './app/styles/main.css';

import { configureAmplify } from './common/services/amplify';
import Root from './app/Root';

configureAmplify();

render(<Root />, document.getElementById('root'));
