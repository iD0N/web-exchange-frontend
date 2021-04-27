const expect = require('chai').expect;
require('mocha-steps');

// pages
const TraderHeader = require('./pageobjects/Trader/Header.page');
const VerifyEmailPage = require('./pageobjects/VerifyEmail.page');
const ProfilePage = require('./pageobjects/Profile.page');

// use component steps from the NewAccount scene so we can see details of any
// step failures, but still stay in sync with the shared code
const NewAccount = require('./scenes/NewAccount.scene');

describe('Crypto e-mail registration', function() {
  let email;
  let code;

  // this duplicates
  step('Request a new address from GMail', function() {
    email = NewAccount.getAddress();
  });

  step('Sign up with the new address', function() {
    NewAccount.signUp(email);
  });

  step('Fetch the confirmation code from GMail', async function() {
    code = await NewAccount.getConfirmationCode(email);
  });

  step('Input the received confirmation code', function() {
    NewAccount.submitConfirmationCode(code);
  });

  step('Add name and verify correct e-mail is shown on My Profile', function() {
    TraderHeader.waitForPageLoad();
    TraderHeader.openAccountSettings();
    ProfilePage.waitForPageLoad();

    expect(
      ProfilePage.givenNameInput.getAttribute('placeholder'),
      'Given Name is an input placeholder'
    ).to.be.equal('First Name');
    expect(
      ProfilePage.familyNameInput.getAttribute('placeholder'),
      'Family Name is an input placeholder'
    ).to.be.equal('Last Name');

    ProfilePage.givenNameInput.setValue('Automation');
    ProfilePage.familyNameInput.setValue('Test');
    ProfilePage.submit.click();
    ProfilePage.profileUpdatedMessage.waitForVisible();

    expect(
      ProfilePage.email.getAttribute('value'),
      'Email on My Profile page was not correct'
    ).to.equal(email);
  });

  step('Request another GMail address', function() {
    email = NewAccount.getAddress();
  });

  step('Change e-mail to the new address', function() {
    ProfilePage.changeEmailButton.click();
    ProfilePage.email.setValue(email);
    ProfilePage.submit.click();
  });

  step('Fetch the confirmation code from the new address', async function() {
    code = await NewAccount.getConfirmationCode(email);
  });

  step('Input the second verification code', function() {
    VerifyEmailPage.codeInput.setValue(code);
    VerifyEmailPage.submit.click();

    ProfilePage.waitForPageLoad();

    expect(
      ProfilePage.email.getAttribute('value'),
      'Email on My Profile page was not correct'
    ).to.equal(email);
  });
});
