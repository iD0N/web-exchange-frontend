import { fireEvent } from 'react-testing-library';

import {
  wrapComponent,
  queryById,
  querySubmitButtons,
  setFieldValue,
} from '../../../../test/utils';

import ForgottenPassword from './';

const renderComponent = wrapComponent(ForgottenPassword);

describe('ForgottenPassword.js', () => {
  const props = {
    isLoading: false,
    onSubmit: jest.fn(),
  };

  let container;

  beforeEach(() => {
    container = renderComponent(props).container;
  });

  describe('when empty', () => {
    it('should autofocus the email input', () => {
      const email = queryById(container, 'email');

      expect(email).toHaveFocus();
    });

    it('should have disabled submit button', () => {
      const [submit, ...rest] = querySubmitButtons(container);

      expect(rest).toHaveLength(0);
      expect(submit).toHaveAttribute('disabled');
    });
  });

  describe('when filled in', () => {
    it('should call submit action onSubmit', () => {
      const email = queryById(container, 'email');
      const [submit] = querySubmitButtons(container);

      setFieldValue(email, 'valid@email.com');

      expect(submit).not.toHaveAttribute('disabled');
      fireEvent.click(submit);
      expect(props.onSubmit).toHaveBeenCalled();
    });
  });
});
