import { fireEvent } from 'react-testing-library';

import {
  queryById,
  querySubmitButtons,
  setFieldValue,
  wrapComponent,
} from '../../../../test/utils';

import ConfirmLogin from './';

const renderComponent = wrapComponent(ConfirmLogin);

describe('ConfirmLogin.js', () => {
  const props = {
    isLoading: false,
    onSubmit: jest.fn(),
  };

  let container;

  beforeEach(() => {
    container = renderComponent(props).container;
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
