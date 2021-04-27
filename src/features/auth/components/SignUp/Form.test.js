import { fireEvent } from 'react-testing-library';

import {
  wrapComponent,
  queryById,
  querySubmitButtons,
  setFieldValue,
  clickCheckbox,
} from '../../../../test/utils';

import Form from './Form';

const renderComponent = wrapComponent(Form);

describe('Form.js', () => {
  const props = {
    isLoading: false,
    onSubmit: jest.fn(),
  };

  let getByText;
  let container;

  beforeEach(() => {
    const dom = renderComponent(props);

    getByText = dom.getByText;
    container = dom.container;
  });

  // describe('social sign up buttons', () => {
  //   it('should allow signup with google', () => {
  //     expect(getByText('Sign Up with Google')).toBeInTheDocument();
  //   });
  //
  //   it('should allow signup with facebook', () => {
  //     expect(getByText('Sign Up with Facebook')).toBeInTheDocument();
  //   });
  // });

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
      const [submit] = querySubmitButtons(container);
      const email = queryById(container, 'email');
      const password = queryById(container, 'password');
      const agreement = queryById(container, 'agreement');

      setFieldValue(email, 'valid@email.com');
      setFieldValue(password, 'password');
      clickCheckbox(agreement);

      expect(submit).not.toHaveAttribute('disabled');
      fireEvent.click(submit);
      expect(props.onSubmit).toHaveBeenCalled();
    });
  });
});
