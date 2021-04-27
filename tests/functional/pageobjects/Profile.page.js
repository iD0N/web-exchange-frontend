const Page = require('./Page');

module.exports = new (class Profile extends Page {
  get givenNameInput() {
    return browser.element('#given_name');
  }

  get familyNameInput() {
    return browser.element('#family_name');
  }

  get submit() {
    return browser.element('//span[text()="Save"]/parent::button');
  }

  get profileUpdatedMessage() {
    return browser.element('//span[text()="Your profile information has been updated."]');
  }

  get heading() {
    return browser.element('//span[text()="Account Settings"]/parent::h1');
  }

  get spinner() {
    return browser.element('.ant-spin-spinning');
  }

  get email() {
    return browser.element('#email');
  }

  get password() {
    return browser.element('#password');
  }

  get language() {
    return browser.element('.language-dropdown--trigger');
  }

  get setupMFA() {
    return browser.element(
      '//span[text()="Multifactor Authentication"]/parent::label/parent::div/following-sibling::div//button'
    );
  }

  get changePasswordButton() {
    return browser.element(
      '//span[text()="Password"]/parent::label/parent::div/following-sibling::div//button'
    );
  }

  get changeEmailButton() {
    return browser.element('//input[@id="email"]/following-sibling::span//button');
  }

  waitForPageLoad() {
    this.heading.waitForVisible();
    this.spinner.waitForVisible(5000, true);
  }
})();
