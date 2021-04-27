const Page = require('./Page');

module.exports = new (class Login extends Page {
  get path() {
    return '/auth/login';
  }

  get signupAgreement() {
    return browser.element('//input[@id="agreement"]');
  }

  get emailInput() {
    return browser.element('#email');
  }

  get passwordInput() {
    return browser.element('#password');
  }

  get submit() {
    return browser.element('button[type="submit"]');
  }

  get heading() {
    return browser.element('//span[text()="Log In"]');
  }

  get googleLogin() {
    return browser.element('.ant-btn-google');
  }

  get facebookLogin() {
    return browser.element('.ant-btn-facebook');
  }

  get MFACodeInput() {
    return browser.element('#code');
  }

  logInWithEmail(mail, password, otp) {
    this.emailInput.setValue(mail);
    this.passwordInput.setValue(password);
    this.submit.click();
    if (otp) {
      this.MFACodeInput.waitForVisible();
      this.MFACodeInput.setValue(otp);
      this.submit.click();
    }
  }

  // Override
  waitForPageLoad() {
    this.heading.waitForVisible();
  }
})();
