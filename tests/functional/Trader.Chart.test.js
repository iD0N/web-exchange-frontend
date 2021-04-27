const expect = require('chai').expect;
require('mocha-steps');

const Chart = require('./pageobjects/Trader/Chart.page');
const TraderHeader = require('./pageobjects/Trader/Header.page');

const NewAccount = require('./scenes/NewAccount.scene');

const contractCode = require('./common/contractCode');

const contractCodeBch = 'BCHM19';
const contractCodeLtc = 'LTCM19';
// const contractCodeBch = contractCode('BCH');
// const contractCodeLtc = contractCode('LTC');

describe('Crypto Trader UI - Chart', function() {
  step('Creates a new account', async function() {
    await NewAccount.createNewAccount();
  });

  step('Navigate to Trader UI', function() {
    TraderHeader.open();
    TraderHeader.waitForPageLoad();
  });

  step('Verify Watchlist finishes loading', function() {
    Chart.waitForLoad();
  });

  step('Verify child components', function() {
    Chart.waitForComponentsLoaded();
  });

  step('Add chart comparison series', function() {
    // TODO these are not resiliant to monthly contract expiration -- replace
    // with dynamic values so the test doesn't break over time
    Chart.addContractComparison(contractCodeBch);
    Chart.addContractComparison(contractCodeLtc);

    var reBCH = new RegExp(contractCodeBch + '(\n[0-9]+.[0-9]{2})?', 'gm');
    expect(
      Chart.comparisonLegendRow(contractCodeBch).getText(),
      'Bitcoin Cash legend should match regex'
    ).to.match(reBCH);

    var reLTC = new RegExp(contractCodeLtc + '(\n[0-9]+.[0-9]{2})?', 'gm');
    expect(
      Chart.comparisonLegendRow(contractCodeLtc).getText(),
      'Litecoin legend should match regex'
    ).to.match(reLTC);

    Chart.deleteContractComparison(contractCodeBch);
    Chart.deleteContractComparison(contractCodeLtc);
  });
});
