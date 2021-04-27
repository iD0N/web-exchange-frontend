import once from 'lodash.once';

const INTERNAL_COOKIE_NAME = 'internal';
const INTERNAL_COOKIE_VALUE = 'merkle';

export const DEV = 'dev';
export const ALPHA = 'alpha';
export const BETA = 'testnet';
export const PROD = 'prod';

export const OAUTH_SIGNIN_PATH = 'oauth2response';
export const CONTACT_EMAIL = 'support@crypto.io';

// change this for easy local testing
const localWebDomain = 'localhost:3000';
const localGatewayDomain = 'api.alpha.acdx.io';
// const localGatewayDomain = 'localhost:8080';

// Global config values go here

const authBase = {
  region: 'ap-northeast-1',
  mandatorySignIn: true,
  cookieStorage: {
    domain: '.acdx.io',
    expires: 30,
    secure: true,
  },
};

const oauthBase = {
  scope: ['openid', 'profile', 'email', 'phone', 'aws.cognito.signin.user.admin'],
  responseType: 'code',
};

const sentry = {
  dsn: 'https://x@sentry.io/x',
};

const settings = {
  [DEV]: {
    recaptchaSitekey: '6LdAqv8UAAAAAM_8wqjbEUu5oEN3MRAYJFAiWM8K',
    baseURL: 'https://www.alpha.acdx.io',
    rootUrl: 'http://localhost:3000',
    amplify: {
      ...authBase,
      // this is an Alpha pool client which supports redirect to localhost:3000
      userPoolId: 'ap-northeast-1_C1qIKS0yl',
      userPoolWebClientId: '5cej29kcavm0mrm5kgc52fbh1d',
      userPoolMobileClientId: '6qf6rld99l3mq53nk2evgiin0l',
      oauth: {
        ...oauthBase,
        domain: 'auth.alpha.acdx.io',
        redirectSignIn: `http://${localWebDomain}/${OAUTH_SIGNIN_PATH}`,
        redirectSignOut: `https://www.alpha.acdx.io/`,
      },
      cookieStorage: {
        domain: 'localhost',
        path: '/',
        expires: 1,
        secure: false,
      },
    },
    launchDarkly: {
      clientId: '5f5d047cd3bac209fa83388c',
    },
    sentry,
    apiURL: `http://${localGatewayDomain}/v1/`,
    wsURL: `wss://${localGatewayDomain}/v1/`,
    // null allows us to default to the current domain for local dev
    cookieDomain: null,
    enableDebug: false,
    logLevel: 'WARN',
  },
};

// Config Utils
export const selectStage = once(() => {
  const domain = window.location.hostname;

  const domainToStage = {
    'app.alpha.acdx.io': ALPHA,
  };

  return domainToStage[domain] || DEV;
});

export const selectRootUrl = env => {
  if (env && settings[env]) {
    return settings[env].rootUrl;
  }
  return settings[selectStage()].rootUrl;
};

// Internal cookie for preview-only features
export function hasInternalCookie(cookies) {
  return cookies.get(INTERNAL_COOKIE_NAME) === INTERNAL_COOKIE_VALUE;
}

export const isDevStage = once(() => selectStage() === DEV);

export const isTestnet = once(() => selectStage() === BETA);

export const isProd = once(() => selectStage() === PROD);

export function cookieDomainOption() {
  if (isProd() || isTestnet()) {
    return { domain: '.acdx.io' };
  }
  return {domain: '/'};
}

export function getStage() {
  return selectStage();
}

export default once(() => settings[selectStage()]);
