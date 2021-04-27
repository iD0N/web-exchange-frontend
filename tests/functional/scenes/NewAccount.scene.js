/**
 * The NewAccount scene models the process of creating a new Crypto account with
 * a fresh email, going through the sign-up process, and arriving at the home
 * page.
 *
 * This should be used by any test scenario which wants to operate in the
 * context of a new account with fresh data (which should be most of them).
 */

const TraderHeader = require('../pageobjects/Trader/Header.page');
const LoginPage = require('../pageobjects/Login.page');
const CreateAccountPage = require('../pageobjects/CreateAccount.page');
const VerifyEmailPage = require('../pageobjects/VerifyEmail.page');

const gmail = require('../common/gmail');

// extract a verification code from an Crypto sign-up email
const selectConfirmationCode = html => html.match(/>([0-9]{6})</)[1];

// NewAccount exposes both a broad 'createNewAccount' method and the individual
// component steps which it calls, so that tests can use individual pieces
// directly when needed
module.exports = new (class NewAccount {
  // TODO this is going to get a bit slow in CBT if we are creating a new account
  // for every scenario synchronously -- we may want to speed it up by expanding the
  // scene below to allow creating one new account for a whole scenario, and then
  // sharing the credentials with all members of that suite

  // call createNewAccount to run through the whole scene, or individual steps below
  async createNewAccount() {
    const email = this.getAddress();

    this.signUp(email);
    this.verifyEmail(email);

    browser.waitUntil(
      () => TraderHeader.menuDropdownTrigger.value || CreateAccountPage.agreements.value,
      15000,
      'Neither trader page nor Create account page is visible'
    );

    if (CreateAccountPage.agreements.value) {
      CreateAccountPage.agreements.click();
      CreateAccountPage.submit.click();

      TraderHeader.waitForPageLoad();
    }

    return email;
  }

  getAddress() {
    return gmail.getAddress();
  }

  signUp(email) {
    // open the signup page
    LoginPage.open();
    TraderHeader.signupButton.click();

    // fill out the form and submit
    LoginPage.emailInput.setValue(email);
    LoginPage.passwordInput.setValue('password');
    LoginPage.signupAgreement.click();
    LoginPage.submit.click();
  }

  async verifyEmail(email) {
    // browser.call required on nested async called under wdio testrunner because
    // Node Fibers are freaking magic and blow up if you look at them funny
    // see: https://github.com/webdriverio/webdriverio/issues/2622

    const confirmationCode = browser.call(async () => this.getConfirmationCode(email));

    this.submitConfirmationCode(confirmationCode);
  }

  async getConfirmationCode(email) {
    // get the confirmation code from gmail and submit
    const [{ html }] = await gmail.getMessages(email);

    return selectConfirmationCode(html);
  }

  submitConfirmationCode(code) {
    VerifyEmailPage.codeInput.setValue(code);
    VerifyEmailPage.submit.click();
  }
})();
