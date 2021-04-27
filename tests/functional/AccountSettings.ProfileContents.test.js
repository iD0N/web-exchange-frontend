const expect = require('chai').expect;
require('mocha-steps');

const TraderHeader = require('./pageobjects/Trader/Header.page');
const ProfilePage = require('./pageobjects/Profile.page');

const NewAccount = require('./scenes/NewAccount.scene');

describe('Crypto profile page', function() {
  step('Create a new account', async function() {
    await NewAccount.createNewAccount();
  });

  step('Navigate to Trader UI', function() {
    TraderHeader.waitForPageLoad();
  });

  step('Navigate to My Profile', function() {
    TraderHeader.openAccountSettings();
    ProfilePage.waitForPageLoad();
  });

  step('Verify My Profile page content', function() {
    expect(ProfilePage.givenNameInput.isVisible(), 'Given name input not visible').to.be.true;
    expect(ProfilePage.familyNameInput.isVisible(), 'Family name input not visible').to.be.true;
    expect(ProfilePage.submit.isVisible(), 'Submit button not visible').to.be.true;
    expect(ProfilePage.heading.isVisible(), 'My Profile heading not visible').to.be.true;
    expect(ProfilePage.email.isVisible(), 'Email input not visible').to.be.true;
    expect(ProfilePage.password.isVisible(), 'Password input not visible').to.be.true;
    expect(ProfilePage.language.isVisible(), 'Language dropdown not visible').to.be.true;
    expect(ProfilePage.setupMFA.isVisible(), 'Setup MFA button not visible').to.be.true;
    expect(
      ProfilePage.changePasswordButton.isVisible(),
      'Change password button not visible'
    ).to.be.true;
    expect(ProfilePage.changeEmailButton.isVisible(), 'Change Email button not visible').to.be.true;
  });

  step('Change names and verify they are saved', function() {
    ProfilePage.givenNameInput.setValueClean('Changed');
    ProfilePage.familyNameInput.setValueClean('Changed');
    ProfilePage.submit.click();

    ProfilePage.profileUpdatedMessage.waitForVisible();
    expect(
      ProfilePage.profileUpdatedMessage.isVisible(),
      'Profile updated message is not visible'
    ).to.be.true;

    expect(ProfilePage.givenNameInput.getValue()).to.equal('Changed');
    expect(ProfilePage.familyNameInput.getValue()).to.equal('Changed');

    ProfilePage.profileUpdatedMessage.waitForVisible(5000, true);
    // Waits for success message to not be visible (2nd argument)

    ProfilePage.givenNameInput.setValueClean('Original');
    ProfilePage.familyNameInput.setValueClean('Original');
    ProfilePage.submit.click();

    ProfilePage.profileUpdatedMessage.waitForVisible();
    expect(
      ProfilePage.profileUpdatedMessage.isVisible(),
      'Profile updated message is not visible'
    ).to.be.true;

    ProfilePage.givenNameInput.waitForVisible();
    expect(ProfilePage.givenNameInput.getValue()).to.equal('Original');
    expect(ProfilePage.familyNameInput.getValue()).to.equal('Original');
  });
});
