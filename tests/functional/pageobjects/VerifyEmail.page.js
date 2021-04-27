const Page = require('./Page');

module.exports = new (class VerifyEmail extends Page {
  get codeInput() {
    return browser.element('#code');
  }

  get submit() {
    return browser.element('button[type="submit"]');
  }

  waitForPageLoad() {
    this.codeInput.waitForVisible();
  }
})();
