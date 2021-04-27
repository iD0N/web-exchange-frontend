const Widget = require('../Widget');

module.exports = new (class Orders extends Widget {
  get elementId() {
    return 'orders';
  }

  get moveHandle() {
    return browser.element(this.Xpath + '//i[contains(@class, "icon-drag")]');
  }
})();
