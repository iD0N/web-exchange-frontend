const buildVersion = (process.env.CODEBUILD_RESOLVED_SOURCE_VERSION || 'dev').slice(0, 8);
const buildDate = process.env.CODEBUILD_START_TIME || new Date().toISOString();
const build = `${buildVersion}@${buildDate}`;

exports.config = {
  user: 'abc@crypto.com',
  key: 'ue7bac6f7d7de03f',

  specs: ['./tests/functional/*.test.js'],
  exclude: [
    './tests/functional/Trader.OrderBook.test.js',
    './tests/functional/Trader.Chart.test.js',
  ],

  // limited by paid plan
  maxInstances: 1,

  updateJob: false,
  //  specs: ['./tests/functional/*.test.js'],
  specs: [],
  exclude: [],

  capabilities: [
    {
      browserName: 'Chrome',
      platform: 'Windows 10',
      screenResolution: '1680x1050',
      record_video: true,
      record_network: true,
      build,
    },
  ],

  logLevel: 'silent',
  coloredLogs: true,
  screenshotPath: './test_output/errorShots/',
  baseUrl: 'https://app.alpha.crypto.com?internal=merkle',
  waitforTimeout: 30000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,

  host: 'hub.crossbrowsertesting.com',
  port: 80,

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 180000,
  },

  reporters: ['spec'],

  beforeSession: function(config, capabilities, specs) {
    capabilities.name =
      (specs && specs[0].match(/[a-zA-Z]*\.test\.js/)[0].slice(0, -8)) || undefined;
  },

  beforeSuite: function() {
    browser.windowHandleMaximize();
  },
};
