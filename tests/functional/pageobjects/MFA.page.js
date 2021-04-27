const Page = require('./Page');

module.exports = new (class MFA extends Page {
  get codeInput() {
    return browser.element('#code');
  }

  get QRCode() {
    return browser.element('//*[@data-qrcode]');
  }

  get heading() {
    return browser.element('//*[text()="Setup Multi-factor Auth"]');
  }

  get authenticatorText() {
    return browser.element(
      '//p[contains(., "Scan the code with a one-time password (OTP) app like Google Authenticator.")]'
    );
  }

  get enterPasswordText() {
    return browser.element('//p[contains(., "Then enter the generated password below:")]');
  }

  get enableMFAButton() {
    return browser.element('//span[text()="Enable MFA"]/parent::button');
  }

  get MFAEnabledText() {
    return browser.element(
      '//span[text()="Multi-factor authentication has been successfully enabled."]'
    );
  }

  getSecret() {
    return this.QRCode.getAttribute('data-qrcode')
      .match(/secret=[A-Z0-9]+/)[0]
      .split('=')[1];
  }

  waitForPageLoad() {
    this.codeInput.waitForVisible();
  }
})();
