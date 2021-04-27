import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { render, fireEvent } from 'react-testing-library';
import configureStore from 'redux-mock-store';

const mockStore = configureStore();

export function wrapComponent(Component) {
  return function renderComponent(props, store = mockStore({})) {
    return render(
      <MemoryRouter>
        <Provider store={store}>
          <Component {...props} />
        </Provider>
      </MemoryRouter>
    );
  };
}

export function queryById(container, id) {
  return container.querySelector('#' + id);
}

export function querySubmitButtons(container) {
  return container.querySelectorAll('button[type=submit]');
}

export function setFieldValue(field, value) {
  fireEvent.change(field, { target: { value } });
}

export function clickCheckbox(checkbox) {
  fireEvent.click(checkbox);
}

export function getLatestArgs(jestFn) {
  return jestFn.mock.calls.slice(-1)[0];
}
