const Page = require('./Page');

module.exports = new (class Footer extends Page {
  selectFromFooter(selector) {
    return browser.element(`//div[contains(@class, "layout-footer")]${selector}`);
  }

  get whitepaper() {
    return this.selectFromFooter('//a[contains(text(), "Whitepaper")]');
  }

  get termsAndConditions() {
    return this.selectFromFooter('//a[contains(text(), "Terms and conditions")]');
  }

  get privacyPolicy() {
    return this.selectFromFooter('//a[contains(text(), "Privacy Policy")]');
  }

  get twitter() {
    return browser.element('.twitter');
  }

  get telegram() {
    return browser.element('.telegram');
  }

  get linkedin() {
    return browser.element('.linkedin');
  }

  get medium() {
    return browser.element('.medium');
  }

  waitForPageLoad() {
    this.codeInput.waitForVisible();
  }
})();
