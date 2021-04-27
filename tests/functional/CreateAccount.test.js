const expect = require('chai').expect;
require('mocha-steps');

const CreateAccountPage = require('./pageobjects/CreateAccount.page');
const TraderHeader = require('./pageobjects/Trader/Header.page');

const NewAccount = require('./scenes/NewAccount.scene');

describe('CreateAccount (interstitial) form test', () => {
  step('Signup with simulated terms acceptance network fail', () => {
    browser.url('/?internal=merkle');
    browser.setCookie({ name: 'signup-skip-accept-terms', value: 'true' });

    const email = NewAccount.getAddress();

    NewAccount.signUp(email);
    NewAccount.verifyEmail(email);
  });

  step('Accept the terms', () => {
    CreateAccountPage.waitForPageLoad();
    CreateAccountPage.agreements.click();
  });

  step('Complete sign up (accepts the terms)', () => {
    CreateAccountPage.submit.click();
    TraderHeader.waitForPageLoad();
    expect(TraderHeader.isLoggedInVersion(), 'Trader header does not indicate logged-in state').to
      .be.true;
  });
});
