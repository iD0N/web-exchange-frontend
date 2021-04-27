// monkey-patch browser to work around a bug in Chromedriver which sometimes results
// in setValue appending instead of replacing
// TODO there might be a slightly better place to put this, but everything test
// should end up including Page so it's good enough for now
browser.origElement = browser.element;
browser.element = (...argsOuter) => {
  let el = browser.origElement(...argsOuter);
  // tried to monkey-patch this over setValue so it's automatic, but setValue is
  // a read-only property and JS got cranky...
  if (!el.setValueClean) {
    el.setValueClean = val => {
      el.clearElement();
      browser.pause(100);
      if (el.getValue()) {
        // double click to select all
        el.doubleClick();
        // send a backspace to delete
        el.keys('\uE003');
        browser.pause(100);
      }
      el.addValue(val);
    };
  }
  return el;
};

module.exports = class Page {
  open() {
    const path = this.path;
    if (path === undefined || path === null) {
      throw new Error(`Page must define 'get path()' before open() is called`);
    }
    browser.url('/?internal=merkle');
    browser.pause(100);
    browser.url(path);
    this.waitForPageLoad();
  }

  waitForPageLoad() {
    // override this in child classes to create custom waits
  }
};
