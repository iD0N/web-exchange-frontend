const Page = require('./Page');
const otplib = require('otplib');

const config = require('../config');

module.exports = new (class GoogleSignIn extends Page {
  get emailInput() {
    return browser.element('#identifierId');
  }

  get identifierNext() {
    return browser.element('#identifierNext');
  }

  get passwordNext() {
    return browser.element('#passwordNext');
  }

  get totpNext() {
    return browser.element('#totpNext');
  }

  get passwordInput() {
    return browser.element('//input[@name="password"]');
  }

  get authCodeInput() {
    return browser.element('#totpPin');
  }

  login(credentials = config.googleCredentials) {
    this.emailInput.waitForVisible();
    this.emailInput.setValue(config.googleCredentials.email);
    this.identifierNext.waitForVisible();
    this.identifierNext.click();
    this.passwordInput.waitForVisible();
    this.passwordInput.setValue(credentials.password);
    this.passwordNext.waitForVisible();
    this.passwordNext.click();
    if (credentials.totpSecret) {
      this.authCodeInput.waitForVisible();
      this.authCodeInput.setValue(otplib.authenticator.generate(credentials.totpSecret));
      this.totpNext.waitForVisible();
      this.totpNext.click();
    }
  }
})();
