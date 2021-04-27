const Widget = require('../Widget');

module.exports = new (class Chart extends Widget {
  get elementId() {
    return 'chart';
  }

  get chartPanel() {
    return browser.element('.stx-panel-chart');
  }

  get chartCompareButton() {
    return browser.element(this.Xpath + '//span[text()="+ Compare"]/parent::button');
  }

  get chartContractSearchInput() {
    return browser.element(this.Xpath + '//input[contains(@class, "trader-select-search__field")]');
  }

  contractListOption(currency) {
    return browser.element('//li[@role="option" and contains(@name,"' + currency + '")]');
  }

  comparisonLegendRow(currency) {
    return browser.element(this.Xpath + '//*[text()="' + currency + '"]//parent::li');
  }

  comparisonLegendDelete(currency) {
    return browser.element(
      this.Xpath + '//*[text()="' + currency + '"]//parent::li//i[contains(@class,"delete")]'
    );
  }

  waitForComponentsLoaded() {
    this.chartPanel.waitForVisible();
    this.chartCompareButton.waitForVisible();
  }

  addContractComparison(contract) {
    this.chartCompareButton.click();
    this.chartContractSearchInput.addValue(contract);
    this.contractListOption(contract).click();
    this.comparisonLegendRow(contract).waitForVisible();
  }

  deleteContractComparison(contract) {
    this.comparisonLegendDelete(contract).click();
    this.comparisonLegendRow(contract).waitForVisible(5000, true);
  }

  waitForComponentsLoaded() {
    this.chartPanel.waitForVisible();
    this.chartCompareButton.waitForVisible();
  }
})();
