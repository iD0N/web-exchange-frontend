const Page = require('../Page');
const OrderEntry = require('./OrderEntry.page');

module.exports = new (class Header extends Page {
  get Xpath() {
    return '//div[@class="trader-layout-header"]';
  }

  get path() {
    return '/trader';
  }

  get itself() {
    return browser.element(this.Xpath);
  }

  get logo() {
    return browser.element('.logo');
  }

  get spinner() {
    return browser.element('.ant-spin');
  }

  get tradeButton() {
    return browser.element(this.Xpath + '//span[contains(text(), "Trade")]/parent::button');
  }

  get accountSummaryTrigger() {
    return browser.element('.account-summary-trigger');
  }

  get accountSummaryDropdown() {
    return browser.element('.account-summary-overlay');
  }

  get menuDropdownTrigger() {
    return browser.element('.account-settings-trigger');
  }

  get menuDropdown() {
    return browser.element('.account-settings-overlay');
  }

  get menuWorkspace() {
    return browser.element('//*[text()="Workspace"]');
  }

  get menuResetLayout() {
    return browser.element('//*[contains(text(), "Reset to ") and contains(text(), "Default")]');
  }

  get notificationTrayTrigger() {
    return browser.element('.notification-tray-trigger');
  }

  get menuAccountSettings() {
    return browser.element('//*[text()="Account Settings"]//parent::a');
  }

  get menuAPI() {
    return browser.element('//*[text()="API"]//parent::a');
  }

  get logout() {
    return browser.element('.logout');
  }

  get logoutMenuItem() {
    return browser.element('//*[text()="Logout"]//parent::a');
  }

  get signupButton() {
    return browser.element('.signup');
  }

  waitForPageLoad() {
    this.logo.waitForVisible();
    this.spinner.waitForVisible(30000, true);
    this.menuDropdownTrigger.waitForVisible(5000);
  }

  isLoggedInVersion() {
    return this.notificationTrayTrigger.isVisible();
  }

  menuLogout() {
    this.itself.waitForVisible();
    this.menuDropdownTrigger.waitForVisible();
    this.menuDropdownTrigger.moveToObject();
    this.logoutMenuItem.waitForVisible();
    this.logoutMenuItem.click();
  }

  isVisible() {
    return this.itself.isVisible();
  }

  toggleOrderEntry(open) {
    if (open && !OrderEntry.isVisible()) {
      this.tradeButton.click();
      browser.pause(1000);
    } else if (!open && OrderEntry.isVisible()) {
      this.tradeButton.click();
      browser.pause(1000);
    }
  }

  resetLayout() {
    this.menuDropdownTrigger.moveToObject();
    this.menuWorkspace.waitForVisible();
    this.menuWorkspace.moveToObject();
    this.menuResetLayout.waitForVisible();
    this.menuResetLayout.click();
  }

  openAccountSettings() {
    this.spinner.waitForVisible(10000, true);
    this.menuDropdownTrigger.waitForVisible(5000);
    this.menuDropdownTrigger.moveToObject();
    this.menuDropdown.waitForVisible();
    this.menuAccountSettings.waitForVisible();
    this.menuAccountSettings.click();
  }

  openAPIKeys() {
    this.menuDropdownTrigger.moveToObject();
    this.menuAPI.waitForVisible();
    this.menuAPI.click();
  }
})();
