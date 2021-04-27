const expect = require('chai').expect;
require('mocha-steps');

const LoginPage = require('./pageobjects/Login.page');
const FacebookSignInPage = require('./pageobjects/FacebookSignIn.page');
const TraderHeader = require('./pageobjects/Trader/Header.page');

// NOTE this only tests login when the user has already clicked past terms and
// such -- does not test for new signup, which has additional screens
describe('Crypto login through Facebook', function() {
  // TODO: log in with a test account obtained through Graph API

  step('Open login page and choose Facebook log in', function() {
    LoginPage.open();
    LoginPage.facebookLogin.click();
  });

  step('Get through Facebook login and arrive at home page', function() {
    FacebookSignInPage.login('ftaawqinxk_1537230615@tfbnw.net', 'testtesttesty');

    TraderHeader.waitForPageLoad(20000);
    expect(
      TraderHeader.isLoggedInVersion(),
      'Trader header does not indicate logged-in state'
    ).to.be.true;
  });
});
