const Page = require('./Page');

module.exports = class Widget extends Page {
  get Xpath() {
    return `//div[@id="${this.elementId}"]`;
  }

  get itself() {
    return browser.element(this.Xpath);
  }

  get spinner() {
    return browser.element(this.Xpath + '//*[contains(@class, "ant-spin-spinning")]');
  }

  isVisible() {
    return this.itself.isVisible();
  }

  waitForPageLoad() {
    this.itself.waitForVisible();
  }

  waitForLoad() {
    this.itself.waitForVisible();
    this.spinner.waitForVisible(10000, true);
    browser.pause(500);
    this.spinner.waitForVisible(10000, true);
    browser.pause(500);
  }
};
