import { fireEvent } from 'react-testing-library';

import {
  wrapComponent,
  queryById,
  querySubmitButtons,
  setFieldValue,
  clickCheckbox,
} from '../../../../../test/utils';

import CreateAccount from './';

const renderComponent = wrapComponent(CreateAccount);

describe('CreateAccount.js', () => {
  describe('when email was not shared from identity provider', () => {
    const props = {
      userAttributes: {
        given_name: 'given_name',
        family_name: 'family_name',
      },
      isMissingEmail: true,
      isMissingAgreements: true,
      isLoading: false,
      onSubmit: jest.fn(),
    };

    let dom;

    beforeEach(() => {
      dom = renderComponent(props);
    });

    describe('provided information', () => {
      it('should display family and given name, both disabled', () => {
        const { getByLabelText, container } = dom;
        const givenName = getByLabelText('Given name');
        const familyName = getByLabelText('Family name');
        const email = queryById(container, 'email');

        expect(givenName).toHaveAttribute('disabled');
        expect(familyName).toHaveAttribute('disabled');
        expect(email).not.toHaveAttribute('disabled');
      });
    });

    describe('when empty', () => {
      it('should autofocus the email input', () => {
        const { container } = dom;
        const email = queryById(container, 'email');

        expect(email).toHaveFocus();
      });

      it('should have disabled submit button', () => {
        const { container } = dom;
        const [submit, ...rest] = querySubmitButtons(container);

        expect(rest).toHaveLength(0);
        expect(submit).toHaveAttribute('disabled');
      });
    });

    describe('when filled in', () => {
      it('should call submit action onSubmit', () => {
        const { container } = dom;
        const [submit] = querySubmitButtons(container);
        const email = queryById(container, 'email');
        const agreements = queryById(container, 'agreements');

        setFieldValue(email, 'valid@email.com');
        clickCheckbox(agreements);

        expect(submit).not.toHaveAttribute('disabled');
        fireEvent.click(submit);
        expect(props.onSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('when obtained email from identity provider', () => {
    const props = {
      userAttributes: {
        given_name: 'given_name',
        family_name: 'family_name',
        email: 'email',
      },
      isMissingEmail: false,
      isMissingAgreements: true,
      isLoading: false,
      onSubmit: jest.fn(),
    };

    let dom;

    beforeEach(() => {
      dom = renderComponent(props);
    });

    describe('provided information', () => {
      it('should display email, family and given name, all disabled', () => {
        const { getByLabelText, container } = dom;
        const givenName = getByLabelText('Given name');
        const familyName = getByLabelText('Family name');
        const email = queryById(container, 'email');

        expect(givenName).toHaveAttribute('disabled');
        expect(familyName).toHaveAttribute('disabled');
        expect(email).toHaveAttribute('disabled');
      });
    });

    describe('when empty', () => {
      it('should autofocus the agreements checkbox', () => {
        const { container } = dom;
        const agreements = queryById(container, 'agreements');

        expect(agreements).toHaveFocus();
      });

      it('should have disabled submit button', () => {
        const { container } = dom;
        const [submit, ...rest] = querySubmitButtons(container);

        expect(rest).toHaveLength(0);
        expect(submit).toHaveAttribute('disabled');
      });
    });

    describe('when filled in', () => {
      it('should call submit action onSubmit', () => {
        const { container } = dom;
        const [submit] = querySubmitButtons(container);
        const agreements = queryById(container, 'agreements');

        clickCheckbox(agreements);

        expect(submit).not.toHaveAttribute('disabled');
        fireEvent.click(submit);
        expect(props.onSubmit).toHaveBeenCalled();
      });
    });
  });
});
