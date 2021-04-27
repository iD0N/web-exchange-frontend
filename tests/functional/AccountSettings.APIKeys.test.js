const expect = require('chai').expect;
require('mocha-steps');

const APIKeysPage = require('./pageobjects/AccountSettings/APIKeys.page');
const TraderHeader = require('./pageobjects/Trader/Header.page');

const NewAccount = require('./scenes/NewAccount.scene');

describe('Crypto API Keys Page', function() {
  step('Create a new account', async function() {
    await NewAccount.createNewAccount();
  });

  step('Navigate to Trader UI', function() {
    TraderHeader.waitForPageLoad();
  });

  step('Navigate to API Keys page', function() {
    TraderHeader.openAPIKeys();
    APIKeysPage.waitForPageLoad();
  });

  step('API Keys delete existing keys', function() {
    APIKeysPage.deleteAllApiKeys();
    APIKeysPage.noKeysText.waitForVisible(1000);
  });

  step('API Keys create key', function() {
    APIKeysPage.createKeyButton.click();

    const createdKey = APIKeysPage.getNewKey();
    APIKeysPage.deleteApiKey(createdKey);
  });
});
