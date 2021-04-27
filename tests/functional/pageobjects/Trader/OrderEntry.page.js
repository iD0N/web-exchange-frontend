const Widget = require('../Widget');

module.exports = new (class OrderEntry extends Widget {
  get elementId() {
    return 'order-entry';
  }

  // TODO this would be cleaner if we left some marker IDs or classes on the elements
  valueFromLabel(label) {
    return browser.element(
      this.Xpath +
        // the span with the label text we want
        `//span[text()="${label}"]` +
        // up to the item which wraps the label and value
        '/ancestor::*[contains(@class, "trader-form-item")]' +
        // and down to the span which holds the value text
        '//span[@class="trader-form-text"]'
    );
  }

  // TODO accessor for label?
  get last() {
    return this.valueFromLabel('Last ');
  }

  // TODO accessor for label?
  get ask() {
    return this.valueFromLabel('Ask ');
  }

  // TODO accessor for label?
  get bid() {
    return this.valueFromLabel('Bid ');
  }

  get contractSummary() {
    return browser.element(this.Xpath + '//div[@class="contract-summary"]');
  }

  get quantityInput() {
    return browser.element(this.Xpath + '//input[@id="size"]');
  }

  get priceInput() {
    return browser.element(this.Xpath + '//input[@id="price"]');
  }

  get notionalValue() {
    return browser.element(
      this.Xpath +
        '//span[contains(text(), "Notional Value")]/ancestor::div[1]//following-sibling::div'
    );
  }

  get limitRadioButton() {
    return browser.element(
      this.Xpath +
        '//label[@class="order-entry-order-type-limit trader-radio-button-wrapper trader-radio-button-wrapper-checked"]'
    );
  }

  get marketRadioButton() {
    return browser.element(
      this.Xpath + '//label[@class="order-entry-order-type-market trader-radio-button-wrapper"]'
    );
  }

  get orderBuyButton() {
    return browser.element(this.Xpath + '//button[contains(@class, "trader-btn-positive")]');
  }

  get orderSellButton() {
    return browser.element(this.Xpath + '//button[contains(@class, "trader-btn-negative")]');
  }

  waitForLoad() {
    this.itself.waitForVisible();
    browser.pause(500);
  }

  waitForComponentsLoaded() {
    this.last.waitForVisible();
    this.ask.waitForVisible();
    this.bid.waitForVisible();
    this.quantityInput.waitForVisible();
    this.priceInput.waitForVisible();
    this.orderBuyButton.waitForVisible();
    this.orderSellButton.waitForVisible();
  }
})();
