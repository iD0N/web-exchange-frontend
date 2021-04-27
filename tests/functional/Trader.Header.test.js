const expect = require('chai').expect;
require('mocha-steps');

const TraderHeader = require('./pageobjects/Trader/Header.page');

const NewAccount = require('./scenes/NewAccount.scene');

describe('Crypto Trader UI - Header', function() {
  step('Create a new account', async function() {
    await NewAccount.createNewAccount();
  });

  step('Navigate to Trader UI', function() {
    TraderHeader.waitForPageLoad();
  });

  step('Verify header component', function() {
    // reset mouse position to logo
    TraderHeader.logo.isVisible();
    TraderHeader.accountSummaryTrigger.waitForVisible();

    // account summary starts collapsed
    expect(
      TraderHeader.accountSummaryDropdown.isVisible(),
      'Account Summary should not be visible'
    ).to.be.false;

    // on mouse over it drops down
    TraderHeader.accountSummaryTrigger.isVisible();
    TraderHeader.accountSummaryTrigger.moveToObject();
    browser.pause(1000);
    expect(
      TraderHeader.accountSummaryDropdown.isVisible(),
      'Account Summary should be visible'
    ).to.be.true;

    // check the contents of the dropdown for suitability
    // TODO these regex checks are super hard to read, can we write a more expressive check?
    // var re1 = /^DAY P\/L\n[A-Z]* \-?[0-9]*\.[0-9]{2}\nOPEN P\/L\n[A-Z]* \-?[0-9]*\.[0-9]{2}$/gm;
    // expect(
    //   TraderHeader.accountSummaryTrigger.getText(),
    //   'Account Summary header text should match given regex'
    // ).to.match(re1);
    // var re2 = /ACCOUNT SUMMARY\n((DAY|OPEN|CLOSED|TOTAL) P\/L\n[A-Z]* \-?[0-9]*\.[0-9]{2}\n){4}TOKEN BALANCE\n[0-9.,]* Crypto\nTOTAL COLLATERAL\nUSD [0-9.,]*\nMAINT\. MARGIN\nUSD [0-9.,]*\n[0-9.]*\%\nINITIAL MARGIN\nUSD [0-9.,]*\n[0-9.]*\%/gm;
    // expect(
    //   TraderHeader.accountSummaryDropdown.getText(),
    //   'Account Summary header dropdown text should match given regex'
    // ).to.match(re2);
  });
});
