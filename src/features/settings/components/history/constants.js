export const TRANSACTIONS = {
  ADMIN: 'ADMIN',
  AFFIL: 'AFFIL',
  BLK_FEE: 'BLK_FEE',
  BONUS: 'BONUS',
  CREDIT: 'CREDIT',
  DEBUG: 'DEBUG',
  DEPOSIT: 'DEPOSIT',
  FEE: 'FEE',
  FUNDING: 'FUNDING',
  LEV_TAX: 'LEV_TAX',
  LIQ_FEE: 'LIQ_FEE',
  OTHER: 'OTHER',
  PL: 'PL',
  REBALNCE: 'REBALNCE',
  REPAY: 'REPAY',
  SWAP: 'SWAP',
  TOP_UP: 'TOP_UP',
  WITHDRAWAL: 'WITHDRAWAL',
  WITH_FEE: 'WITH_FEE',
  XFER: 'XFER',
};

export const TRANSACTION_LABEL = {
  [TRANSACTIONS.ADMIN]: 'settings.history.transactionType.adminAdjustment',
  [TRANSACTIONS.AFFIL]: 'settings.history.transactionType.affiliateIncome',
  [TRANSACTIONS.BLK_FEE]: 'settings.history.transactionType.blockchainFee',
  [TRANSACTIONS.BONUS]: 'settings.history.transactionType.bonus',
  [TRANSACTIONS.CREDIT]: 'settings.history.transactionType.credit',
  [TRANSACTIONS.DEBUG]: 'settings.history.transactionType.debug',
  [TRANSACTIONS.DEPOSIT]: 'settings.history.transactionType.deposit',
  [TRANSACTIONS.FEE]: 'settings.history.transactionType.fee',
  [TRANSACTIONS.FUNDING]: 'settings.history.transactionType.swapFunding',
  [TRANSACTIONS.LEV_TAX]: 'settings.history.transactionType.leverageTax',
  [TRANSACTIONS.LIQ_FEE]: 'settings.history.transactionType.liquidationFee',
  [TRANSACTIONS.OTHER]: 'settings.history.transactionType.other',
  [TRANSACTIONS.PL]: 'settings.history.transactionType.pl',
  [TRANSACTIONS.REBALNCE]: 'settings.history.transactionType.rebalance',
  [TRANSACTIONS.REPAY]: 'settings.history.transactionType.leverageTaxRefund',
  [TRANSACTIONS.SWAP]: 'settings.history.transactionType.spotTrade',
  [TRANSACTIONS.TOP_UP]: 'settings.history.transactionType.insuraceFundDisbursement',
  [TRANSACTIONS.WITHDRAWAL]: 'settings.history.transactionType.withdrawal',
  [TRANSACTIONS.WITH_FEE]: 'settings.history.transactionType.withdrawalFee',
  [TRANSACTIONS.XFER]: 'settings.history.transactionType.transfer',
};
