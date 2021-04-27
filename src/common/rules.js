import moment from 'moment';
import BigNumber from 'bignumber.js';

import { t } from './services/i18n';

const MAX_EMAIL_LENGTH = 128;
const MIN_PASSWORD_LENGTH = 8;
const MIN_ALIAS_LENGTH = 3;
const MAX_ALIAS_LENGTH = 100;

const required = {
  required: true,
  message: t('validation.required', { defaultValue: 'Field is required' }),
};

const checked = {
  validator: (rule, value, callback) => {
    callback(
      !value ? t('validation.checked', { defaultValue: 'Field must be checked' }) : undefined
    );
  },
};

const email = [
  {
    type: 'email',
    message: t('validation.email.invalid', { defaultValue: 'E-mail is not valid' }),
  },
  {
    max: MAX_EMAIL_LENGTH,
    message: t('validation.email.length', {
      maxLength: MAX_EMAIL_LENGTH,
      defaultValue: 'Email must contain at maximum {{maxLength}} characters',
    }),
  },
];

const password = {
  type: 'string',
  message: t('validation.password.invalid', { defaultValue: 'Password is not valid' }),
};

const passwordWithLimit = [
  password,
  required,
  {
    min: MIN_PASSWORD_LENGTH,
    message: t('validation.password.length', {
      minLength: MIN_PASSWORD_LENGTH,
      defaultValue: 'Password must contain at least {{minLength}} characters',
    }),
  },
];

const momentDate = {
  validator: (rule, value, callback) =>
    callback(
      value && !moment.isMoment(value)
        ? t('validation.date.invalid', { defaultValue: 'Date is not valid' })
        : undefined
    ),
};

const code = {
  type: 'string',
  len: 6,
  message: t('validation.code.invalid', { defaultValue: 'Code must contain 6 characters' }),
};

const alias = {
  min: MIN_ALIAS_LENGTH,
  max: MAX_ALIAS_LENGTH,
  message: t('validation.alias.length', {
    minLength: MIN_ALIAS_LENGTH,
    maxLength: MAX_ALIAS_LENGTH,
    defaultValue: 'Alias must be from {{minLength}} to {{maxLength}} characters long',
  }),
};

const number = {
  type: 'number',
  message: t('validation.number.invalid', { defaultValue: 'Field must be a number' }),
};

const positiveNumber = {
  validator: (rule, value, callback) =>
    callback(
      value !== undefined && value <= 0
        ? t('validation.positiveNumber.invalid', { defaultValue: 'Field must be higher than 0' })
        : undefined
    ),
};

const mobileNumber = {
  validator: (rule, value, callback) =>
    callback(
      value !== undefined && value <= 0
        ? t('validation.number.invalid', { defaultValue: 'Field must be a number' })
        : undefined
    ),
};

const multipleOf = step => ({
  validator: (rule, value, callback) => {
    callback(
      value !== undefined &&
        !BigNumber(value)
          .modulo(step)
          .isZero()
        ? t('validation.multipleOf.invalid', {
            step,
            defaultValue: 'Field must be a multiple of {{step}}',
          })
        : undefined
    );
  },
});

const maxValue = max => ({
  validator: (rule, value, callback) => {
    callback(
      value > max
        ? t('validation.maxValue.invalid', { defaultValue: `Field must not exceed ${max}`, max })
        : undefined
    );
  },
});

export default {
  alias,
  required,
  checked,
  email,
  password,
  passwordWithLimit,
  maxValue,
  mobileNumber,
  momentDate,
  code,
  number,
  positiveNumber,
  multipleOf,
};
