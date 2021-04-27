export const supportedResolutions = [
  '1',
  '5',
  '15',
  '30',
  '60',
  '120',
  '180',
  '240',
  'D',
  'M',
  'W',
];

export const cleanInterval = interval => {
  let cleaned = String(interval);
  if (Number.isNaN(Number(interval)) && String(interval).substring(0, 1) === '1') {
    cleaned = cleaned.substring(1);
  }

  if (supportedResolutions.includes(cleaned)) {
    return cleaned;
  }

  return '5';
};

export const supportedCandleTypes = [0, 1, 2, 3, 8, 9];

const defaultChartConfig = {
  layout: {
    tvInterval: '5',
    tvChartType: 1,
  },
  tradeModeEnabled: false,
};

export default defaultChartConfig;
