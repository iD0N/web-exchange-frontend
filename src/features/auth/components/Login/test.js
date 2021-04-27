import { fireEvent } from 'react-testing-library';

import {
  wrapComponent,
  queryById,
  querySubmitButtons,
  setFieldValue,
} from '../../../../test/utils';

import Login from './';

const renderComponent = wrapComponent(Login);

describe('Login.js', () => {
  const props = {
    isLoading: false,
    onSubmit: jest.fn(),
  };

  let container;
  let getByText;

  beforeEach(() => {
    const dom = renderComponent(props);
    getByText = dom.getByText;
    container = dom.container;
  });

  describe('when empty', () => {
    it('should have disabled submit button', () => {
      const [submit, ...rest] = querySubmitButtons(container);

      expect(rest).toHaveLength(0);
      expect(submit).toHaveAttribute('disabled');
    });

    describe('social login buttons', () => {
      it('should allow login with Google and Facebook', () => {
        expect(getByText('Login with Google')).toBeInTheDocument();
        expect(getByText('Login with Facebook')).toBeInTheDocument();
      });
    });
  });

  describe('when filled in', () => {
    it('should call submit action', () => {
      const email = queryById(container, 'email');
      const password = queryById(container, 'password');

      setFieldValue(email, 'valid@email.com');
      setFieldValue(password, 'atLeast8Chars');

      const [submit] = querySubmitButtons(container);

      expect(submit).not.toHaveAttribute('disabled');
      fireEvent.click(submit);
      expect(props.onSubmit).toHaveBeenCalled();
    });
  });
});
