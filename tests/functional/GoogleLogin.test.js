const expect = require('chai').expect;
require('mocha-steps');

const LoginPage = require('./pageobjects/Login.page');
const GoogleSignInPage = require('./pageobjects/GoogleSignIn.page');
const TraderHeader = require('./pageobjects/Trader/Header.page');

describe('Crypto login through Google', function() {
  step('Open login page and choose Google log in', function() {
    LoginPage.open();
    LoginPage.googleLogin.click();
  });

  step('Get through Google login and arrive at home page', function() {
    GoogleSignInPage.login();

    TraderHeader.waitForPageLoad(20000);
    expect(
      TraderHeader.isLoggedInVersion(),
      'Trader header does not indicate logged-in state'
    ).to.be.true;
  });
});
