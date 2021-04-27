const Page = require('./Page');

module.exports = new (class Header extends Page {
  get path() {
    return '/trader';
  }

  get logo() {
    return browser.element('.logo');
  }
  get trade() {
    return browser.element('//ul[@role="menu"]//span[contains(text(), "Trade")]/parent::a');
  }

  get news() {
    return browser.element('//ul[@role="menu"]//span[contains(text(), "News")]/parent::a');
  }

  get myProfile() {
    return browser.element('//ul[@role="menu"]//span[contains(text(), "My Profile")]/parent::a');
  }

  get team() {
    return browser.element('//ul[@role="menu"]//span[contains(text(), "Team")]/parent::a');
  }

  get docs() {
    return browser.element('//li[@role="menuitem"]//span[contains(text(), "Docs")]');
  }

  get whitepaper() {
    return browser.element('//ul[@role="menu"]//span[contains(text(), "Whitepaper")]/parent::a');
  }

  get mobileOpenMenu() {
    return browser.element('.nav-toggle');
  }

  get mobileCloseMenu() {
    return browser.element('.anticon-close-circle-o');
  }

  get logout() {
    return browser.element('.logout');
  }

  get signupButton() {
    return browser.element('.signup');
  }

  waitForPageLoad() {
    this.codeInput.waitForVisible();
  }

  openMobileMenuIfPossible() {
    if (this.mobileOpenMenu.isVisible()) {
      this.mobileOpenMenu.click();
    }
  }

  closeMobileMenuIfPossible() {
    if (this.mobileCloseMenu.isVisible()) {
      this.mobileCloseMenu.click();
    }
  }
})();
