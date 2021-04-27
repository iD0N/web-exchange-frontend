import { t } from '../../../../common/services/i18n';

export const MIN_VOLUME = Number.MIN_VALUE;

export const MAX_TRADES_COUNT = 50;

export const MIN_TRADE_SIZE_OPTIONS = [
  { label: t('trader.timeAndSales.minTradeSize.all', { defaultValue: 'All' }), value: 0 },
  { label: '1', value: 1 },
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
];
