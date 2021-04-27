const Widget = require('../Widget');

module.exports = new (class Positions extends Widget {
  get elementId() {
    return 'positions';
  }

  get moveHandle() {
    return browser.element(this.Xpath + '//i[contains(@class, "icon-drag")]');
  }
})();
