const Widget = require('../Widget');

module.exports = new (class OrderBook extends Widget {
  get elementId() {
    return 'orderBook';
  }

  get firstRow() {
    return browser.element('(' + this.Xpath + '//tbody//tr)[1]');
  }

  get tradeSwitch() {
    return browser.element(this.Xpath + '//button[contains(@class, "trader-switch")]');
  }

  get tradeOrderQuantity() {
    return browser.element(this.Xpath + '//input[@id="orderQuantity"]');
  }

  get tradeOrderBuy() {
    return browser.element(this.Xpath + '//button[contains(., "Buy")]');
  }

  get tradeOrderSell() {
    return browser.element(this.Xpath + '//button[contains(., "Sell")]');
  }

  clickFirstRowReturnPrice() {
    var price = this.firstRow.getText().match(/[0-9]*\.[0-9]{2}/);
    this.firstRow.click();
    if (price !== null) {
      return price[0];
    }
    return null;
  }
})();
