import { fireEvent } from 'react-testing-library';

import {
  queryById,
  querySubmitButtons,
  setFieldValue,
  wrapComponent,
} from '../../../../test/utils';

import VerifyEmail from './';

const renderComponent = wrapComponent(VerifyEmail);

describe('VerifyEmail.js', () => {
  const props = {
    emailCredentialExists: true,
    isLoading: false,
    isResendEmailVerificationLoading: false,
    onResendEmailVerification: jest.fn(),
    onSubmit: jest.fn(),
    isLoggingIn: false,
  };

  let getByText;
  let container;

  beforeEach(() => {
    const dom = renderComponent(props);
    getByText = dom.getByText;
    container = dom.container;
  });

  describe('resend code button', () => {
    it('should be enabled', () => {
      const resendCodeBtn = getByText('Resend code');

      expect(resendCodeBtn).not.toHaveAttribute('disabled');
    });

    it('should call resend email action when clicked', () => {
      const resendCodeBtn = getByText('Resend code');

      fireEvent.click(resendCodeBtn);
      expect(props.onResendEmailVerification).toHaveBeenCalled();
    });
  });

  describe('when empty', () => {
    it('should autofocus the code input', () => {
      const code = queryById(container, 'code');

      expect(code).toHaveFocus();
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
      const code = queryById(container, 'code');

      setFieldValue(code, '123456');

      expect(submit).not.toHaveAttribute('disabled');
      fireEvent.click(submit);
      expect(props.onSubmit).toHaveBeenCalled();
    });
  });
});
