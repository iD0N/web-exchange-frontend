const { acdxInternalCookie } = require('../config');

/* global browser */
exports.config = {
  exclude: [
    './tests/functional/Trader.OrderBook.test.js',
    './tests/functional/Trader.Chart.test.js',
  ],

  maxInstances: 2,
  capabilities: [
    {
      browserName: 'chrome',
      chromeOptions: {
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-impl-side-painting',
          '--headless',
          '--disable-gpu',
          '--window-size=1200x600',
          // see: https://github.com/elgalu/docker-selenium/issues/20
          '--disable-dev-shm-usage',
        ],
      },
    },
  ],

  services: ['selenium-standalone'],
  seleniumArgs: {
    javaArgs: ['-Dwebdriver.chrome.driver=/usr/bin/chromedriver'],
  },
  seleniumInstallArgs: {},
  seleniumLogs: './test_outputs/logs',

  logLevel: 'error',
  coloredLogs: true,
  screenshotPath: './test_outputs/errorShots/',
  baseUrl: 'http://localhost:3000?internal=merkle',
  waitforTimeout: 30000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 99999999,
  },

  reporters: ['spec'],

  /**
   * Runs after a WebdriverIO command gets executed
   * @param {String} commandName hook command name
   * @param {Array} args arguments that command would receive
   * @param {Number} result 0 - command success, 1 - command error
   * @param {Object} error error object if any
   */
  afterCommand: function(commandName, args, result, error) {
    // console.log(commandName + '(' + args + ');');
  },
  beforeSuite: function() {
    browser.url('http://localhost:3000?internal=merkle');
    browser.setCookie(acdxInternalCookie);
    // browser.windowHandleMaximize();
    browser.windowHandleSize({ width: 1920, height: 1080 });
  },
};
