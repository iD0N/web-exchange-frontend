import { combineReducers } from 'redux';

import { createReducer } from '../../utils/reduxHelpers';

const generateSecondaryId = () => `${Math.round(Math.random() * 100000000000000)}`;

const initialState = {
  secondary: generateSecondaryId(),
};

/**
 * REDUCERS
 */
const secondary = createReducer(initialState.secondary);

export default combineReducers({
  secondary,
});

/**
 * SELECTORS
 */
export const selectLaunchDarkly = state => state.launchDarkly;
export const selectSecondary = state => selectLaunchDarkly(state).secondary;
