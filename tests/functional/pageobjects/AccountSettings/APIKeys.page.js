const Page = require('../Page');

module.exports = new (class APIKeysModal extends Page {
  get Xpath() {
    return '//div[@id="settings-api-keys-wrapper"]';
  }

  get itself() {
    return browser.element(this.Xpath);
  }

  get spinner() {
    return browser.element(this.Xpath + '//div[contains(@class, "ant-spin-blur")]');
  }

  get createKeyButton() {
    return browser.element(this.Xpath + '//span[text()="Create New Key"]/parent::button');
  }

  get newKeyValue() {
    return browser.element(
      this.Xpath +
        '//span[text()="New Key"]/ancestor::div[@class="trader-form-item-label"]/following-sibling::div'
    );
  }

  get secretValue() {
    return browser.element(
      this.Xpath +
        '//span[text()="Secret"]/ancestor::div[@class="trader-form-item-label"]/following-sibling::div'
    );
  }

  apiKeyDelete(apiKey) {
    return browser.element(
      this.Xpath + '//span[text()="' + apiKey + '"]/ancestor::tr//i[@class="acdx-icon icon-delete"]'
    );
  }

  get firstApiKeyDelete() {
    return browser.element('(' + this.Xpath + '//i[@class="acdx-icon icon-delete"])[1]');
  }

  get noKeysText() {
    return browser.element(this.Xpath + '//span[text()="No keys"]');
  }

  waitForPageLoad() {
    this.itself.waitForVisible();
    this.spinner.waitForVisible(60000, true);
  }

  isVisible() {
    return this.itself.isVisible();
  }

  getNewKey() {
    this.newKeyValue.waitForVisible();
    return this.newKeyValue.getText();
  }

  getSecret() {
    this.secretValue.waitForVisible();
    return this.secretValue.getText();
  }

  deleteApiKey(apiKey) {
    this.spinner.waitForVisible(10000, true);
    this.apiKeyDelete(apiKey).waitForVisible();
    this.apiKeyDelete(apiKey).click();
  }

  deleteAllApiKeys() {
    this.spinner.waitForVisible(10000, true);
    while (!this.noKeysText.isVisible()) {
      this.firstApiKeyDelete.waitForVisible();
      this.firstApiKeyDelete.click();
      this.spinner.waitForVisible(10000, true);
    }
    this.noKeysText.waitForVisible(1000);
  }
})();
