const Page = require('./Page');

module.exports = new (class CreateAccount extends Page {
  get agreements() {
    return browser.element('.agreements-checkbox');
  }

  get submit() {
    return browser.element('button[type="submit"]');
  }

  get spinner() {
    return browser.element('.ant-spin-spinning');
  }

  waitForPageLoad() {
    this.spinner.waitForVisible(5000, true);
    this.agreements.waitForVisible(10000);
    browser.pause(2000);
  }
})();
