const Page = require('./Page');

module.exports = new (class FacebookSignIn extends Page {
  get emailInput() {
    return browser.element('#email');
  }

  get loginButton() {
    return browser.element('#loginbutton');
  }

  get passwordInput() {
    return browser.element('#pass');
  }

  login(email, password) {
    this.emailInput.waitForVisible();
    this.emailInput.setValue(email);
    this.passwordInput.setValue(password);
    this.loginButton.click();
  }
})();
