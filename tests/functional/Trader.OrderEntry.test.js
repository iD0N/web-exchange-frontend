const expect = require('chai').expect;
require('mocha-steps');

const OrderEntry = require('./pageobjects/Trader/OrderEntry.page');
const TraderHeader = require('./pageobjects/Trader/Header.page');

const NewAccount = require('./scenes/NewAccount.scene');

const FORMATTED_PRICE = /[0-9]{2,8}.[0-9]{2}/;

describe('Crypto Trader UI - Order Entry', () => {
  step('Create a new account', async () => {
    await NewAccount.createNewAccount();
  });

  step('Navigate to Trader UI', function() {
    TraderHeader.waitForPageLoad();
  });

  step('Verify Order Entry finishes loading', () => {
    OrderEntry.waitForLoad();
  });

  step('Verify child components', () => {
    OrderEntry.waitForComponentsLoaded();
  });

  step('Verify order entry initial state', () => {
    expect(OrderEntry.isVisible()).to.be.true;

    // ensure the form items are visible
    OrderEntry.last.waitForVisible();

    browser.pause(500);

    expect(OrderEntry.limitRadioButton.isVisible(), 'Limit radio visible').to.be.true;
    expect(OrderEntry.priceInput.isVisible(), 'Price input visible').to.be.true;

    expect(OrderEntry.quantityInput.getValue(), 'Quantity input value').to.equal('');
    expect(OrderEntry.priceInput.getValue(), 'Price input value').to.match(FORMATTED_PRICE);

    expect(OrderEntry.orderBuyButton.isEnabled(), 'Buy button enabled').to.be.false;
  });

  step('Change quantity (size) to non-zero value', () => {
    OrderEntry.quantityInput.setValue('2');

    const unitPrice = Number(OrderEntry.priceInput.getValue());
    const totalPrice = Number(
      OrderEntry.notionalValue
        .getText()
        .replace('$', '')
        .replace(',', '')
    );

    expect(totalPrice, 'Total price should be unit price multiplied by 2').to.equal(2 * unitPrice);
    expect(OrderEntry.orderBuyButton.isEnabled(), 'Buy button enabled').to.be.true;
  });

  step('Set order type to Limit', () => {
    OrderEntry.limitRadioButton.click();
    expect(OrderEntry.priceInput.isVisible(), 'Price input visible');
    expect(OrderEntry.priceInput.getValue(), 'Price input value').to.match(FORMATTED_PRICE);
  });

  step('Set order type to Market', () => {
    OrderEntry.marketRadioButton.click();
    expect(!OrderEntry.priceInput.isVisible(), 'Price input visible');
  });

  // TODO test actually submitting an order
});
