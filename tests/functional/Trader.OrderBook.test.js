const expect = require('chai').expect;
require('mocha-steps');

const TraderOrderEntry = require('./pageobjects/Trader/OrderEntry.page');
const TraderHeader = require('./pageobjects/Trader/Header.page');
const OrderBook = require('./pageobjects/Trader/OrderBook.page');

const NewAccount = require('./scenes/NewAccount.scene');

describe('Crypto Trader UI - OrderBook', function() {
  step('Creates a new account', async function() {
    await NewAccount.createNewAccount();
  });

  step('Navigate to Trader UI', function() {
    TraderHeader.waitForPageLoad();
  });

  step('Verify Order Book finishes loading', function() {
    OrderBook.waitForLoad();
  });

  step('Click price level to populate order entry price field', function() {
    TraderOrderEntry.waitForLoad();

    // click a row in the book
    var order_price = OrderBook.clickFirstRowReturnPrice();

    // expect Trade to be opened
    expect(TraderOrderEntry.priceInput.isVisible(), 'Price input visible').to.be.true;
    // and the price of the row to be populated
    expect(
      TraderOrderEntry.priceInput.getValue(),
      'Price in order entry should match the one clicked in order book'
    ).to.equal(order_price);
  });

  // TODO these currently fail because for very long emails the trader menu gets
  // pushed down and covers part of the UI -- we should fix this (truncate email)
  // step('Verify trade from the book features', function() {
  //   TraderHeader.toggleOrderEntry(false);
  //
  //   // TODO these tests are a bit thin
  //   OrderBook.tradeSwitch.click();
  //   expect(OrderBook.tradeOrderQuantity.isVisible()).to.be.true;
  //   expect(OrderBook.tradeOrderBuy.isVisible()).to.be.true;
  //   expect(OrderBook.tradeOrderSell.isVisible()).to.be.true;
  // });
});
