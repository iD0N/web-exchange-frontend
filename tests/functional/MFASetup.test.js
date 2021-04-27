const expect = require('chai').expect;
require('mocha-steps');

const otplib = require('otplib');

const TraderHeader = require('./pageobjects/Trader/Header.page');
const ProfilePage = require('./pageobjects/Profile.page');
const MFAPage = require('./pageobjects/MFA.page');
const LoginPage = require('./pageobjects/Login.page');

const NewAccount = require('./scenes/NewAccount.scene');

describe('Crypto setup MFA', function() {
  let email;
  let secret;

  step('Create a new account', async function() {
    email = await NewAccount.createNewAccount();
  });

  step('Navigate to My Profile and Navigate to MFA Page', function() {
    TraderHeader.waitForPageLoad();
    TraderHeader.openAccountSettings();
    ProfilePage.waitForPageLoad();
    ProfilePage.setupMFA.click();
  });

  step('Get secret code', function() {
    MFAPage.waitForPageLoad();
    secret = MFAPage.getSecret();
  });

  step('Generate and enter OTP', function() {
    MFAPage.codeInput.setValue(otplib.authenticator.generate(secret));
    MFAPage.enableMFAButton.click();
  });

  step('Verify MFA was turned on and close browser', function() {
    MFAPage.MFAEnabledText.waitForVisible();
    TraderHeader.menuLogout();
  });

  step('Log in with the MFA turned on', function() {
    LoginPage.open();
    LoginPage.logInWithEmail(email, 'password', otplib.authenticator.generate(secret));
    TraderHeader.waitForPageLoad();
    expect(
      TraderHeader.isLoggedInVersion(),
      'Trader header does not indicate logged-in state'
    ).to.be.true;
  });
});
