import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { reactI18nextModule } from 'react-i18next';

import moment from 'moment';
import 'moment-duration-format';
import 'moment/locale/ko';
import 'moment/locale/zh-cn';
import 'moment/locale/pt-br';
import 'moment/locale/vi';
import 'moment/locale/ru';

import numbro from 'numbro';
import 'numbro/languages/ko-KR';
import 'numbro/languages/zh-CN';
import 'numbro/languages/pt-BR';
// TODO(AustinC): numbro vi (https://github.com/BenjaminVanRyseghem/numbro/pull/295/files)
import 'numbro/languages/ru-RU';

import config from '../../config';
import locales from '../../resources/locales';
import {
//  brazilFlag,
//  brazilFlag2x,
  chinaFlag,
  chinaFlag2x,
  koreaFlag,
  koreaFlag2x,
//  russiaFlag,
//  russiaFlag2x,
  usFlag,
  usFlag2x,
//  vietnamFlag,
//  vietnamFlag2x,
} from '../../resources/images/flags';

const COMMON_NAMESPACE = 'common';

const { cookieDomain } = config();

export const ENGLISH = 'en';
export const KOREAN = 'ko';
export const CHINESE = 'zh';
export const PORTUGUESE = 'pt';
export const VIETNAMESE = 'vi';
export const RUSSIAN = 'ru';

// see: https://www.i18next.com/overview/configuration-options
export const i18nInstance = i18next
  .use(LanguageDetector)
  .use(reactI18nextModule)
  .init({
    ns: COMMON_NAMESPACE,
    defaultNS: COMMON_NAMESPACE,
    nsSeparator: false,
    returnEmptyString: false,
    detection: {
      order: ['cookie', 'navigator'],
      lookupCookie: 'crypto-lang',
      caches: ['cookie'],
      cookieDomain,
      cookieMinutes: 525600,
    },
    whitelist: [ENGLISH, KOREAN, CHINESE],
    // whitelist: [ENGLISH, KOREAN, CHINESE, PORTUGUESE, RUSSIAN, VIETNAMESE],
    // TODO ideally we would enable this, but we need to make multiple other
    // systems support both locale and language codes interchangeably
    // // allows en-US if en is in whitelist, etc.
    // nonExplicitWhitelist: true,
    // if the user language doesn't match anything in the whitelist, use this
    fallbackLng: ENGLISH,
    react: {
      wait: true,
      defaultTransParent: 'span', // TODO remove when https://bugs.chromium.org/p/chromium/issues/detail?id=872770 is fixed
    },
  });

Object.keys(locales).forEach(locale => {
  i18next.addResourceBundle(locale, COMMON_NAMESPACE, locales[locale]);
});

i18next.on('languageChanged', lng => {
  moment.locale(LANGUAGES[lng].momentLocale);
  numbro.setLanguage(LANGUAGES[lng].numbroLocale);
});

export default i18nInstance;

export function t(...args) {
  return i18nInstance.t(...args);
}

export const LANGUAGES = {
  [ENGLISH]: {
    text: t('lang.english', { defaultValue: 'English' }),
    flagImage: usFlag,
    flagImage2x: usFlag2x,
    jumioLocale: ENGLISH,
    momentLocale: ENGLISH,
    numbroLocale: 'en-US',
    telegramLink: 'https://t.me/crypto_io',
    blogLink: 'https://medium.com/crypto',
  },
  [CHINESE]: {
    text: t('lang.chinese', { defaultValue: '简体中文' }),
    flagImage: chinaFlag,
    flagImage2x: chinaFlag2x,
    jumioLocale: 'zh-CN',
    momentLocale: 'zh-CN',
    numbroLocale: 'zh-CN',
    telegramLink: 'https://t.me/crypto_io',
    blogLink: 'https://medium.com/crypto',
  },
  [KOREAN]: {
    text: t('lang.korean', { defaultValue: '한국어' }),
    flagImage: koreaFlag,
    flagImage2x: koreaFlag2x,
    jumioLocale: KOREAN,
    momentLocale: KOREAN,
    numbroLocale: 'ko-KR',
    telegramLink: 'https://t.me/crypto_io',
    blogLink: 'https://medium.com/crypto',
  },
  // [PORTUGUESE]: {
  //   text: t('lang.portuguese', { defaultValue: 'Portuguese (Beta)' }),
  //   flagImage: brazilFlag,
  //   flagImage2x: brazilFlag2x,
  //   jumioLocale: 'pt-BR',
  //   momentLocale: 'pt-BR',
  //   numbroLocale: 'pt-BR',
  //   telegramLink: 'https://t.me/crypto_io',
  //   blogLink: 'https://medium.com/crypto',
  // },
  // [VIETNAMESE]: {
  //   text: t('lang.vietnamese', { defaultValue: 'Vietnamese (Beta)' }),
  //   flagImage: vietnamFlag,
  //   flagImage2x: vietnamFlag2x,
  //   jumioLocale: 'vi',
  //   momentLocale: 'vi',
  //   numbroLocale: 'en-US',
  //   telegramLink: 'https://t.me/crypto_io',
  //   blogLink: 'https://medium.com/crypto',
  // },
  // [RUSSIAN]: {
  //   text: t('lang.russian', { defaultValue: 'Russian (Beta)' }),
  //   flagImage: russiaFlag,
  //   flagImage2x: russiaFlag2x,
  //   jumioLocale: 'ru',
  //   momentLocale: 'ru',
  //   numbroLocale: 'ru-RU',
  //   telegramLink: 'https://t.me/crypto_io',
  //   blogLink: 'https://medium.com/crypto',
  // },
};
