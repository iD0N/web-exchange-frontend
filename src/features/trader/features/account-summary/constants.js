export const ZERO_BALANCE_VALUE = '0.000000';
export const ZERO_USD_VALUE = '0.00';

export const LEGEND_COLORS = {
  RED: 'red',
  ORANGE: 'orange',
  YELLOW: 'yellow',
  GREEN: 'green',
  DARK_BLUE: 'dark-blue',
  DARK_RED: 'dark-red',
};

export const generateLegendClass = color => `margin-bar-value-${color}`;

export const LEGEND_COLOR_CLASSES = {
  [LEGEND_COLORS.RED]: generateLegendClass(LEGEND_COLORS.RED),
  [LEGEND_COLORS.ORANGE]: generateLegendClass(LEGEND_COLORS.ORANGE),
  [LEGEND_COLORS.YELLOW]: generateLegendClass(LEGEND_COLORS.YELLOW),
  [LEGEND_COLORS.GREEN]: generateLegendClass(LEGEND_COLORS.GREEN),
  [LEGEND_COLORS.DARK_BLUE]: generateLegendClass(LEGEND_COLORS.DARK_BLUE),
  [LEGEND_COLORS.DARK_RED]: generateLegendClass(LEGEND_COLORS.DARK_RED),
};
