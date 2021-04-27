var fs = require('fs');
var name;
var was_element = false;

/* global browser */
exports.config = {
  specs: ['./tests/functional/*.test.js'],
  exclude: [
    './tests/functional/Trader.OrderBook.test.js',
    './tests/functional/Trader.Chart.test.js',
  ],

  // override to change parallelism; I recommend not removing this, as without it
  // WDIO used infinite parallelism and tried to melt my laptop with Chrome instances
  maxInstances: process.env.MAX_INSTANCES || 2,
  capabilities: [
    {
      browserName: 'chrome',
    },
  ],

  services: ['selenium-standalone'],
  seleniumLogs: './test_outputs/logs',

  logLevel: 'error',
  coloredLogs: true,
  screenshotPath: './test_outputs/errorShots/',
  baseUrl: 'https://app.alpha.crypto.com?internal=merkle',
  waitforTimeout: 30000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 99999999,
  },

  reporters: ['spec'],

  onPrepare: function() {
    // create the test_output directories if they don't exist
    ['./test_outputs/', './test_outputs/reports/'].forEach(d => {
      if (!fs.existsSync(d)) fs.mkdirSync(d);
    });
  },

  beforeSession: function(config, capabilities, specs) {
    name =
      specs[0].match(/[a-zA-Z]*\.js/)[0].slice(0, -3) +
      '_' +
      (specs && specs[0].match(/[a-zA-Z]*\.test\.js/)[0].slice(0, -8)) +
      '_' +
      new Date()
        .toISOString()
        .slice(0, 19)
        .replace(':', '-')
        .replace(':', '-')
        .replace('T', '_');
    fs.writeFile(
      './test_outputs/reports/' + name + '.txt',
      'This is the test log for ' + name + ' test case:\n',
      function(err) {
        if (err) throw err;
      }
    );
  },

  beforeSuite: function() {
    browser.windowHandlePosition({ x: 0, y: 0 });
    browser.windowHandleSize({ width: 1920, height: 1080 });
  },

  afterCommand: function(commandName, args, result, error) {
    if (error) {
      fs.appendFile(
        './test_outputs/reports/' + name + '.txt',
        '          ' + error + '\n',
        function(err) {
          if (err) throw err;
        }
      );
    }
  },

  beforeCommand: function(commandName, args) {
    if (commandName == 'element') {
      was_element = true;
      fs.appendFile(
        './test_outputs/reports/' + name + '.txt',
        new Date().toISOString().match(/[0-9]{2}:[0-9]{2}:[0-9]{2}/)[0] +
          '  ' +
          commandName +
          '(' +
          args +
          ').',
        function(err) {
          if (err) throw err;
        }
      );
    } else if (was_element) {
      was_element = false;
      fs.appendFile(
        './test_outputs/reports/' + name + '.txt',
        commandName + '(' + args + ')\n',
        function(err) {
          if (err) throw err;
        }
      );
    } else {
      fs.appendFile(
        './test_outputs/reports/' + name + '.txt',
        new Date().toISOString().match(/[0-9]{2}:[0-9]{2}:[0-9]{2}/)[0] +
          '  ' +
          commandName +
          '(' +
          args +
          ');\n',
        function(err) {
          if (err) throw err;
        }
      );
    }
  },
};
